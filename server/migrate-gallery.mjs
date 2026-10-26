import { database, databasePath } from "./db.mjs";

const albums = [
  ["Koncert Tartini v Ljubljani", "Tartini v Ljubljani", "https://www.instagram.com/novaakademija"],
  ["Koncert Tartini junior", "Tartini junior", "https://www.instagram.com/novaakademija"],
  ["Koncert Victimae paschali", "Victimae paschali", "https://www.instagram.com/novaakademija"],
  ["Igranje pri vstajenjski maši, Rakovnik", "Velikonočna maša", "https://www.instagram.com/novaakademija"],
  ["Koncert Gloria in excelsis Deo", "Gloria in excelsis Deo", "https://www.instagram.com/novaakademija"],
  ["Koncert Zven veličastja", "Zven veličastja", "https://www.instagram.com/novaakademija"],
  ["Koncert Baročna polifonija", "Baročna polifonija", "https://www.instagram.com/novaakademija"],
  ["Koncert Bachu v spomin", "Bachu v spomin", "https://www.instagram.com/novaakademija"],
];

const imageDescription = (title, index) => `Fotografija s ${title.toLowerCase()} - Nova akademija, posnetek ${index}`;

const findAlbum = database.prepare("SELECT id FROM gallery_albums WHERE title = ?");
const insertAlbum = database.prepare(
  "INSERT INTO gallery_albums (title, instagram_url, sort_order) VALUES (?, ?, ?)",
);
const findImage = database.prepare("SELECT id FROM gallery_images WHERE album_id = ? AND storage_path = ?");
const insertImage = database.prepare(
  "INSERT INTO gallery_images (album_id, storage_path, original_name, alt_text, sort_order) VALUES (?, ?, ?, ?, ?)",
);
const updateImage = database.prepare(
  "UPDATE gallery_images SET alt_text = ? WHERE album_id = ? AND storage_path = ? AND (alt_text = ? OR alt_text = '')",
);

let albumsCreated = 0;
let imagesCreated = 0;
for (const [sortOrder, [title, folder, instagramUrl]] of albums.entries()) {
  let album = findAlbum.get(title);
  if (!album) {
    const result = insertAlbum.run(title, instagramUrl, sortOrder);
    album = { id: result.lastInsertRowid };
    albumsCreated += 1;
  }
  for (let index = 1; index <= 3; index += 1) {
    const storagePath = `/images/${folder}/${index}.jpg`;
    if (!findImage.get(album.id, storagePath)) {
      insertImage.run(album.id, storagePath, `${index}.jpg`, imageDescription(title, index), index);
      imagesCreated += 1;
    } else {
      updateImage.run(imageDescription(title, index), album.id, storagePath, `${title} ${index}`);
    }
  }
}

console.log(`Gallery migration complete: ${albumsCreated} albums, ${imagesCreated} images in ${databasePath}`);
