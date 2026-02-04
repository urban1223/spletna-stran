import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import urbanImage from "@/assets/members/urban-klancar.jpg";
import lauraImage from "@/assets/members/laura-calligaris.jpg";
import barbaraImage from "@/assets/members/barbara-kepic.jpg";
import marieImage from "@/assets/members/marie-tuhtan.jpg";
import paulinaImage from "@/assets/members/paulina-tuhtan.jpg";
import braneImage from "@/assets/members/brane-rezic.jpg";
import egonImage from "@/assets/members/egon-mihajlović.jpg";
import natalijaImage from "@/assets/members/natalija-ljubotina.jpg";
import erazemImage from "@/assets/members/erazem-zganjar.jpg";
import anaImage from "@/assets/members/ana-birsa.jpg";
import livijaImage from "@/assets/members/livija-zagar.jpg";
import domenImage from "@/assets/members/domen-gvozdanovic.jpg";

const Members = () => {
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null);

  const members = [
    {
      name: "Urban Klančar",
      role: "Glasbenik, organizator",
      instruments: "Baročna oboa, kljunaste flavte, baročni fagot, dulcian, čembalo",
      image: urbanImage,
      shortBio: "Na Akademiji za glasbo (AG LJ) je dokončal diplomski študij pri doc. Mateji Bajt, magistrski študij kljunaste flavte pa je nadaljeval pri prof. Mattijsu Lunenburgu in Maruši Brezavšček. Trenutno na Univerzi za glasbo in uprizoritvene umetnosti Gradec (KUG) študira pri prof. Amy Power historične pihalne inštrumente.",
      fullBio: "Urban Klančar je študiral kljunasto flavto na Konservatoriju za glasbo " + 
              "in balet in študij kljunaste flavte je nadaljeval na Akademiji za glasbo v Ljubljani. " +
              "Magistrski študij je nadaljeval na isti ustanovi, sočasno pa se je vpisl na dodiplomski študij " +
              "baročne oboe na Univerzi za glasbo in upodabljajočo umetnost Gradec. Kot solist in v komorni skupini " +
              "se je udeležil slovenskega državnega tekmovanja TEMSIG in prejel številne nagrade. Kot profesionalni glasbenik bi raje igral v komornih skupinah ter širil zanimanje za staro glasbo med mlajše generacije. Med študijem je igral v različnih glasbenih komornih zasedbah ter sodeloval na številnih uradnih dogodkih v predsedniški palači, Ministrstvu za izobraževanje, Inštitutu Joseph Stefan in drugi. Z renesančno glasbo je skupaj s kolegi nastopal na številnih samostojnih koncertih na gradu Bogenšperk, v samostanu Mekinje in v cerkvi sv. Pavla v Radovljici, koncertnih ciklih Solo e da camera in Glasbena mladina Ljubljanska. Redno sodeluje z Slovenskim baročnim orkestrom, Glasbeno matico Ljubljana, ter drugimi priložnostnimi skupinmi v Sloveniji. V mednarodnih projektih je z igranjem na baročno oboo že nastopil na Dunaju, v Gradcu, Linzu in Salzburgu. Leta 2024 je sodeloval pri projektu Erasmus Fireworks for Europe, ki ga vodita Paolo Grazzi in Alfredo Bernardini, dva izmed članov svetovno znanega ansambla Zefiro, specializiranega za baročni repertoar. Z znanim dirigentom Ernstom Wedamom je izvedel Weichnachtsoratorium z dunajskimi Bachsolisti v Wienerkonzerthausu. Med študijem se je naučil igrati na različna baročna in renesančna glasbila. Dobro obvlada igranje na različne velikosti baročnih flavt ter igranje v consortu flavt. S študijem v Gradcu se je naučil igrati na različne velikosti oboe, dulzianov, in šalmajev Poleg redneg študija se še dodatno izobražuje na številnih mojstrskih tečajih pri številnih znanih profesorjih, kot so Andreas Böhlen, Tabea Schwartz, Lea Sobbe, Stefano Bet, Anne-Susse Enßle, Bettina Simon, Alfredo Bernardini, Adrian Brown in drugi."
    },
    {
      name: "Laura Calligaris",
      role: "Glasbenica",
      instruments: "Violina",
      image: lauraImage,
      shortBio: "V razredu prof. Priye Mitchell (KUG) je zaključila diplomski študij violine, sedaj pa je vpisana k prof. Philippu Graffina na Kraljevi univerzi v Bruslju (KCB). Pri prof. Lucii Hreihofer- Graber (KUG) se je izpopolnjevala na baročni violini. ",
      fullBio: "Violinistka Laura Calligaris, rojena leta 2002, je z igranjem violine začela s petimi leti pri prof. Roku Zgoncu. Od leta 2015 se je violino učila pri prof. Idi Bieler na Visoki šoli za glasbo in upodabljajoče umetnosti v Gradcu, leta 2017 pa se je vpisala na umetniško gimnazijo Konservatorija za glasbo in balet Maribor, kjer jo je violino učila prof. Vesna Čobal. Je dobitnica nagrade “Dr. Romana Klasinca” konservatorija Maribor za leto 2021. Prejela je tudi več priznanj na državnih in mednarodnih tekmovanjih; na TEMSIG-u leta 2018 dvojno zlato plaketo (violina, solfeggio), leta 2020 zlato plaketo in tretjo nagrado s klavirskim triom Libero in leta 2021 kot solistka zlato plaketo in tretjo nagrado. Na mednarodnem tekmovanju Svirel leta 2016 in 2017 zlato plaketo, na tekmovanju Leona Pfeifferja leta 2016 pa drugo nagrado. Februarja 2023 je osvojila 3. nagrado (1. ni bila podeljena) v kategoriji do 32 let, na tekmovanju VIII Agustín Aponte International Music Competition na Tenerifih, Španija. Kot solistka je leta 2017 s Komornim orkestrom slovenskih solistov dvakrat izvedla Mozartov violinski koncert v D-duru, leta 2018 pa je nastopila kot solistka z orkestrom Konservatorija Maribor, s katerim je izvedla Bachov dvojni violinski koncert v d-molu. Leta 2021 je bila sprejeta na Visoko šolo za glasbo in upodabljajoče umetnosti v Gradcu, kjer je z odliko diplomirala v razredu profesorice Priye Mitchell. Oktobra 2024 sta s pianistom Andreyem Ilienkom nastopila v sklopu ciklusa “32. Mladi virtuozi” Festivala Ljubljana. Od septembra 2025 je vpisana v razred Philippa Graffina na Kraljevi univerzi v Bruslju. Igra tudi baročno violino ter je soustanoviteljica društva za baročno glasbo Nova Akademija."
    },
    {
      name: "Barbara Kepic",
      role: "Glasbenica, pedagoginja",
      instruments: "Violončelo",
      image: barbaraImage,
      shortBio: "Na Akademiji za glasbo (AG LJ) je zaključila diplomski in magistrski študij pri prof. " +
      "Karmen Pečar Koritnik, prof. Eldarju Saparayevu in njegovim asistentom g. Sebastianom " +
      "Bertoncljem. Dodatno se izpolnjuje na baročnem čelu pri prof. Kaji Kapus (AG LJ).",
      fullBio: "Barbara Nagode se je violončelo pričela učiti na Glasbeni šoli Moste-Polje pri prof. Kseniji Trotovšek Brlek " +
      "in Katji Beguš-Bobek. Srednješolsko izobraževanje je zaključila na ljubljanskem Konservatoriju za glasbo pri prof. Karmen Pečar " +
      "Koritnik, pri kateri je nadaljevala tudi dodiplomski študij na Akademiji za glasbo v Ljubljani, sedaj pa svoj študij razvija pod " +
      "mentorstvom prof. Eldarja Saparayeva in njegovim asistentom g. Sebastianom Bertoncljem. Redno obiskuje mojstrske tečaje pri priznanih " +
      "pedagogih (Giovanni Gnocchi, Thomas Carroll, Konradin Brotbek, Dragan Đorđević, Reinhard Latzko, Domen Marinčič, Stephan Braun, Matz " +
      "Lidstrom, Thomas Platzgummer, Enrico Dindo, Julian Steckel) in je nagrajenka slovenskega državnega tekmovanja TEMSIG. Zlate plakete je " +
      "prejela tudi na drugih mednarodnih tekmovanjih po Italiji v Trevisu, Povolettu itd. Prav tako gostuje doma in po tujini z različnimi " +
      "komornimi zasedbami. V letu, ki je bilo močno zaznamovano s pandemijo Covid19, je bila na Akademiji na oddelku violončelistov, posebej " +
      "izbrana za projekt v Cankarjevem domu, kjer so skupaj s komornim glasbenim gledališčem, na slovenskih tleh, izvedli krstno izvedbo Leonarda " +
      "Bernsteina operete Candid, ki se je močno pozitivno utrla poslušalcem in javnim kritikom. Zadnja tri leta pod mentorstvom prof. Mihe Haasa, " +
      "deluje v triu Plamen, s katerim so osvojile zlate plakete na državnih in mednarodnih tekmovanjih ter obiskale mednarodni Festival v Firencah " +
      "v letu 2023. Poleg klasičnega učenja violončela dodatno izobražuje tudi na področju stare glasbe-baročno čelo, ki odpira nova znanja pri " +
      "izvajalski praksi, pri profesorici Kaji Kapus. Od leta 2021/22 je tudi štipendistka MOL za nadarjene dijake/študente. V letošnjem letu " +
      "(2024) je uspešno opravila avdicijo v simfoničnem orkestru Mariborske opere ter s septembrom nastopila z delom. Z oddelkom za staro glasbo " + 
      "je velikokrat sodelovala pod mentorstvom prof. Kaje Kapus, med drugim pri projektu Agrippina skladatelja G.F. Handla, izveden v Cankarjevem " +
      "domu in drugih projektih baročnega orkestra AG LJ. Barbara je ena izmed soustanoviteljic društva Nova akademija in redna članica njihovega ansambla."
    },
    {
      name: "Marie Tuhtan",
      role: "Glasbenica, pedagoginja, korepetitorka",
      instruments: "Čembalo, klavir",
      image: marieImage,
      shortBio: "Na Akademiji za glasbo (AG LJ) je 2024 diplomirala iz klavirja pri prof. Vladimirju Mlinariću, trenutno nadaljuje študij klavirske pedagogike v razredu prof. Sae Lee. Vpisana je tudi na umetniški program čembalo pri prof. Egonu Mihajloviću (AG LJ).",
      fullBio: "Marie Tuhtan prihaja iz v Reke na Hrvaškem. Klavir igra od svojega petega leta, osnovno glasbeno izobrazbo pa " +
      "je dobila pri prof. Ivoni Šarčević, pri kateri je obiskovala tudi srednjo glasbeno šolo. " +
      "Leta 2024 je diplomirala iz klavirja pri prof. Vladimirju Mlinariću na Akademiji za glasbo (AG LJ), " +
      "kjer trenutno nadaljuje študij klavirske pedagogike pri prof. Sae Lee in umetniško smer čembala pri " +
      "prof. Egonu Mihajloviću. Marie je pianistka in čembalistka, ki nastopa solistično, v komornih zasedbah " +
      "in kot spremljevalka pevcev, inštrumentalistov, zborov in orkestrov. Obiskuje različne seminarje " +
      "za klavir in čembalo, pri katerih še dodatno poglablja svoje glasbeno izražanje. Je prejemnica številnih " +
      "nagrad iz tekmovanj Sonus, HDGPP, mednarodnega pianističnega tekmovanja v Zagrebu in Smederevu. " +
      "Trenutno je članica društva Nova Akademija, ki se osredotoča za staro glasbo, kjer sodeluje v različnih " + 
      "ansamblih in poglobljeno raziskuje zgodovinsko interpretacijo različnega repertoarja. Še posebej se osredotoča na igranje " +
      "basso continua. Poleg tega sodeluje skupaj s svojo družino kot glasbena družina Tuhtan, s katero nastopa z opernim " +
      "in sakralnim programom. Trenutno kot pianistka in čembalistka sodeluje v duu Impulso z violinistko Natalijo Ljubotino. " +
      "Od leta 2023 poučuje klavir in deluje kot korepetitorka na Glasbeni šoli Amarilis."
    },
    {
      name: "Paulina Tuhtan",
      role: "Glasbenica",
      instruments: "Violina",
      image: paulinaImage,
      shortBio: "V Rijeki je zaključila srednjo glasbeno šolo v razredu prof. Maje Veljak. Trenutno je je študentka 4. letnika Akademije za glasbo Univerze v Zagrebu (MUZA) v razredu prof. Susanne Yoko Henkel, kjer sodeluje v več baročnih projektih. ",
      fullBio: "Paulina Tuhtan je hrvaška violinistka, ki jo še posebej zanima baročna glasba. Violino je začela igrati pri petih letih, nadaljnje izobraževanje pa je opravljala na Osnovni in Srednji glasbeni šoli Ivana Matetića Ronjgova v Reki v razredu prof. Maje Veljak. V srednji šoli se je njeno zanimanje za baročni repertoar poglobilo z igranjem v baročnem komornem ansamblu prof. Laure Vadjon. Trenutno je študentka 4. letnika Akademije za glasbo Univerze v Zagrebu v razredu prof. Susanne Yoko Henkel. " +
      "Redno nastopa v orkestralnih in komornih projektih, pogosto skupaj s sestro Marie Tuhtan ter sodeluje s kolegi iz akademije in muzikologi. Povabljena je bila tudi na kolegij \"Baročna glasba\", namenjen muzikologom, kjer je združevala izvajanje in raziskovalno delo. " +
      "Je prejemnica rektorjeve nagrade za sodelovanje pri pripravi in izvedbi opere Hippolyte et Aricie skladatelja J. P. Rameaua pod vodstvom Franja Bilića, nastopila pa je tudi na izvedbah Te Deum M.A. Charpentierja in izrezkov iz Hippolyte et Aricie pod vodstvom priznanega baročnega dirigenta Hervéja Niqueta. " +
      "Skozi igranje si prizadeva poglabljati razumevanje in interpretacijo stare glasbe ter razvijati sodelovanje s kolegi in muzikologi."
    },
    {
    name: "Natalija Ljubotina",
    role: "Glasbenica, pedagoginja",
    instruments: "Violina",
    image: natalijaImage,
    shortBio: "Na Akademiji za glasbo Ljubljana (AG LJ) je v razredu prof. " +
    "Volodje Balžalorskega zaključila študij violine. Trenutno poučuje na Glasbenem centru Edgar Willems " +
    "in na glasbeni šoli Lartko, poleg pedagoškega dela pa se aktivno udejstvuje " +
    "tudi na koncertnem področju, med drugim v baročnih projektih.",
    fullBio: "Natalija Ljubotina je z igranjem violine začela pri sedmih letih v razredu prof. Plamenke Dražil. " +
    "Srednješolsko glasbeno izobrazbo je opravila na Konservatoriju za glasbo in balet v Ljubljani (KGBL) " +
    "pri prof. Arminu Sešku. Leta 2019 je bila sprejeta na Akademijo za glasbo Ljubljana (AG LJ) " +
    "v razredu prof. Volodje Balžalorskega, kjer je leta 2025 uspešno zaključila študij. " +
    "Trenutno poučuje violino na različnih glasbenih šolah, obenem pa tudi sodeluje pri koncertih " +
    "v različnih zasedbah, med katerimi pomembno mesto zavzemajo tudi baročni projekti. " +

    "Leta 2018 je kot solistka in udeleženka festivala Amadeo nastopila z orkestrom Amadeo " +
    "pod vodstvom Tilna Drakslerja, leto kasneje pa je sodelovala v Slovenskem mladinskem orkestru. " +
    "Leta 2022 je prejela štipendijo za udeležbo mojstrskega tečaja festivala Ljubljana pri Lani Trotovšek, " +
    "januarja 2023 pa je delovala kot substitutka v Simfoničnem orkestru SNG Opera in balet Ljubljana. " +

    "V sklopu udeležb mojstrskih tečajev in poletnih seminarjev je večkrat nastopila " +
    "v Sloveniji, na Hrvaškem in v Avstriji. V študijskem letu 2023/2024 se je udeležila " +
    "študijske izmenjave na Conservatorio Superior de Música Manuel Castillo v Sevilli " +
    "pri prof. Eleni Fernández González, v tem času pa tudi sodelovala z orkestri po Španiji, " +
    "med drugim pri izvedbi dela H. Eslava: Miserere v katedrali v Sevilli. " +

    "Posebno pozornost namenja komornemu muziciranju in historično informirani izvedbi. " +
    "Sodeluje v duu s pianistko in čembalistko Marie Tuhtan, njeno poglobljeno zanimanje za staro glasbo " +
    "pa jo je spodbudilo k sodelovanju v društvu Nova Akademija, katerega članica je postala leta 2025. " +
    "Na področju baročne glasbe je doslej izvedla dela J. S. Bacha, G. Tartinija, G. F. Händla in drugih. " +

    "Svoje znanje redno izpopolnjuje na seminarjih pri profesorjih, kot so Volodja Balžalorsky, " +
    "Wonji Kim Ozim, Benjamin Schmid, Lana Trotovšek, Helfried Fister, Sandor Javorkai, " +
    "Sreten Krstić, Janez Podlesek, Dan Zhu, Armin Sešek, Goran Kentera in Hannah Hurwitz."
    },
    {
      name: "Erazem Žganjar",
      role: "Glasbenik",
      instruments: "Kljunaste flavte, baročni fagot",
      image: erazemImage,
      shortBio: "Na Konservatoriju za glasbo in balet Ljubljana (KGBL) je zaključil izobraževanje na kljunasti flavti in prejel Škerjančevo nagrado za izjemne umetniške dosežke. Na Univerzi Mozarteum Salzburg (MOZ) nadaljuje podiplomski študij koncertne smeri pri prof. Dorothee Oberlinger.",
      fullBio: "Erazem Žganjar (r. 2002) je slovenski izvajalec na kljunasti flavti, " +
      "ki trenutno opravlja podiplomski študij koncertne smeri na Univerzi Mozarteum Salzburg " +
      "pri svetovno priznani flavtistki Dorothee Oberlinger. Je štirikratni dobitnik prve nagrade " +
      "in zlate plakete na slovenskem državnem tekmovanju TEMSIG ter prvi kljunasti flavtist, " +
      "ki je postal zmagovalec razpisa Mladi upi za izjemno nadarjene mlade umetnike, športnike in znanstvenike. " +
      "Prav tako je bil šele drugi kljunasti flavtist, ki je med izobraževanjem na Konservatoriju za glasbo " +
      "in balet Ljubljana prejel Škerjančevo nagrado za izjemne umetniške dosežke. " +

      " Kot solist in komorni glasbenik je nastopil na številnih pomembnih festivalih in koncertnih ciklih, " +
      "med drugim na Festivalu Ljubljana, Festivalu Radovljica, Forumu Blockflöte v Nürnbergu, " +
      "Festivalu ORA v Salzburgu, Slovenskih glasbenih dnevih ter ciklu Solo e da Camera. " +
      "Nastopil je z baročnim orkestrom in vokalnim ansamblom Univerze Mozarteum ter s Centrom za baročno glasbo Versailles, " +
      "redno pa sodeluje tudi s sodobnimi slovenskimi in tujimi skladatelji ter izvaja premiere njihovih del. " +

      " Med njegove najnovejše dosežke sodijo solistični koncerti na Inštitutu za novo glasbo Univerze Mozarteum " +
      "ter na Tednu sodobne glasbe na Bledu v organizaciji Inštitut.abeceda, kjer je deloval kot umetniški vodja ansambla kljunastih flavt. " +
      "Januarja 2026 je skupaj z Dorothee Oberlinger nastopil v Dunajskem Konzerthausu. " +
      "Aprila pa bo izvedel celovečerni koncert kot solist in umetniški vodja z baročnim orkestrom na Festivalu baročne glasbe v St. Johannu."
    },

    {
  name: "Ana Birsa Krušec",
  role: "Glasbenica, pedagoginja",
  instruments: "Kljunaste flavte",
  image: anaImage,
  shortBio: "Leta 2022 je zaključila dodiplomski študij na Akademiji za glasbo (AG LJ) pri doc. Mateji Bajt. Magistrski študij kljunaste flavte je maja 2025 zaključila pri Maruši Brezavšček, del študija pa je opravila tudi na Konservatoriju v Amsterdamu (CvA) pri prof. Jorgu Isaacu. Trenutno poučuje na Glasbenem centru Edgar Willems.",
  fullBio:
    "Ana Birsa Krušec (2000) je glasbeno pot začela leta 2007 na Glasbeni šoli Koper, " +
    "podružnici Izola, v razredu Dušana Kitića. S petnajstimi leti je šolanje nadaljevala " +
    "na Konservatoriju za glasbo in balet v Ljubljani pri prof. Mateji Bajt, " +
    "pod njenim mentorstvom pa je leta 2022 uspešno zaključila tudi dodiplomski študij " +
    "na Akademiji za glasbo v Ljubljani. V tem obdobju je na državnih tekmovanjih TEMSIG " +
    "osvojila tri zlata priznanja, dve prvi nagradi ter posebno nagrado za doseženih 100 točk. " +
    "Magistrski študij je zaključila maja 2025 pri profesorici Maruši Brezavšček. " +
    "Istega leta je bila na študijski izmenjavi na Konservatoriju v Amsterdamu, " +
    "kjer se je izpopolnjevala v razredu prof. Jorga Isaaca ter poglobila svoje znanje " +
    "sodobne in stare glasbe. Redno se izobražuje na mojstrskih tečajih pri " +
    "mednarodno priznanih izvajalcih, kot so Matthijs Lunenburg, Stefano Bagliano, " +
    "Inês d'Avena, Susanna Borsch, Andreas Böhlen, Hester Groenleer in drugi. " +
    "Dejavno koncertira v različnih zasedbah, med drugim v duu Štefana, " +
    "srednjeveški skupini Cappella Justinopolitana, duu Iter Musici, " +
    "v priložnostnih baročnih orkestrih ter kot solistka. Nastopila je " +
    "na uglednih koncertnih ciklih, kot so Glasbena mladina ljubljanska, " +
    "Solo e da camera, GM Oder, Mladi virtuozi in Sakralni abonma."
    },

    {
  name: "Livija Žagar",
  role: "Glasbenica",
  instruments: "Violina, viola",
  image: livijaImage,
  shortBio: "Na Konservatoriju za glasbo in balet Ljubljana (KGBL) je violino študirala v razredu prof. Armina Seška. V Celovcu je na Gustav Mahler Privatuniversität für Musik (GMPU) zaključila študij violine pri prof. Christianu Tacheziju.",
  fullBio:
    "Livija Žagar je po končani nižji glasbeni šoli pri prof. Poloni Češarek " +
    "šolanje nadaljevala na Konservatoriju za glasbo in balet Ljubljana " +
    "pri prof. Arminu Sešku. Študij violine je zaključila " +
    "na Gustav Mahler Privatuniversität für Musik v Celovcu. " +
    "Znanje violine je izpopolnjevala pri prof. Arminu Sešku, " +
    "prof. Vesni Stanković-Moffatt, prof. Tatyani Balashovi, " +
    "prof. Helfriedu Fistru, prof. Anki Schittenhelm, " +
    "prof. Wonji Kim-Ozim in prof. Benjaminu Schmidu. " +
    "S komornim sestavom se je izobraževala na " +
    "Associazione Musicale e Culturale di Farra d'Isonzo – Gorizia, " +
    "Seminari Internationali di Musica da Camera Alpe-Adria. " +
    "Leta 2024 se je kot violistka udeležila " +
    "Stellenbosch International Chamber Music Festival " +
    "v Južni Afriki. " +
    "V študijskem letu 2024/25 je na " +
    "Gustav Mahler Privatuniversität für Musik sodelovala " +
    "pri baročnem projektu, kjer so pod vodstvom " +
    "Klausa Kuchlinga premierno izvedli opero »Penelope«, " +
    "skladatelja Francesca Bartholomea Contija. " +
    "Sodelovala je tudi pri projektu Zven veličastja " +
    "skupaj z APZ France Prešeren in Orkestrom Nova akademija " +
    "ter s Slovenskim baročnim orkestrom " +
    "pri projektu Gloria in excelsis Deo."
},

{
  name: "Domen Gvozdanović",
  role: "Glasbenik",
  instruments: "Kitara, teorba",
  image: domenImage,
  shortBio:
    "Na Konservatoriju za glasbo in balet Ljubljana (KGBL) se je izobraževal v razredih proferjev Mladena Bucića in Jerka Novaka. Leta 2022 je bil sprejet na Akademijo za glasbo v Ljubljani (AG LJ), kjer študira kitaro pri prof. Tomažu Rajteriču.",
  fullBio:
    "Domen Gvozdanović je svojo glasbeno pot začel " +
    "na nižji stopnji Konservatorija za glasbo in balet Ljubljana " +
    "pod mentorstvom prof. Mladena Bucića, šolanje pa nadaljeval " +
    "na srednji stopnji pri prof. Jerku Novaku. " +
    "Leta 2022 je bil sprejet na Akademijo za glasbo v Ljubljani, " +
    "kjer študira kitaro pri prof. Tomažu Rajteriču. " +
    "Po končanem dodiplomskem študiju načrtuje magistrski študij v tujini. " +
    "Kot kitarist sodeluje v različnih komornih sestavih " +
    "(glas–kitara, flavta–kitara, viola–kitara) ter je član " +
    "etno-folk skupine propertea, ki izvaja glasbo različnih " +
    "svetovnih tradicij, vključno z irsko, balkansko, " +
    "južnoameriško, dansko in predvsem slovensko glasbo. " +
    "V preteklem letu je kot teorbist sodeloval v baročnem orkestru " +
    "Akademije za glasbo in nastopil v operi »Kronanje Popeje« " +
    "skladatelja Claudia Monteverdija. " +
    "V okviru koncertnega cikla Solo e da camera je sodeloval " +
    "pri projektu »Zefiro torna« pod vodstvom prof. Egona Mihajlovića. " +
    "Na Gimnaziji Kranj in kasneje v cerkvi sv. Trojice v Ljubljani " +
    "je skupaj z baročnim orkestrom Nova akademija in " +
    "Akademskim pevskim zborom France Prešeren izvedel " +
    "Charpentierjev »Te Deum«. " +
    "V božičnem času je v stolnici sv. Nikolaja sodeloval " +
    "pri izvedbi Bachove kantate »Gloria in excelsis Deo« " +
    "ter prvega dela Händlovega »Mesije«."
},


    {
  name: "Egon Mihajlović - MENTOR",
  role: "Glasbenik, dirigent, pedagog",
  instruments: "Čembalo, hammerklavier, orgle",
  image: egonImage,

  shortBio:
    "Zgodovinske inštrumente s tipkami je študiral na Hochschule für Musik und Darstellende Kunst v Frankfurtu, kjer je diplomiral leta 1992 in leta 1996 končal podiplomski študij z najvišjimi priznanji. Deluje kot mednarodno priznan interpret repertoarja za čembalo in profesor na Akademiji za glasbo v Ljubljani (AG LJ) ter je vodja oddelka za staro glasbo.",

  fullBio:
    "Egon Mihajlovič se je rodil leta 1972 v Postojni. Zgodovinske inštrumente s tipkami (čembalo, hammerklavier, orgle) in staro glasbo je študiral na Visoki šoli za glasbo – Hochschule für Musik und Darstellende Kunst – v Frankfurtu, kjer je leta 1992 diplomiral. Leta 1996 je z najvišjimi priznanji končal podiplomski študij in pridobil naziv koncertnega solista. " +
    "Nastopal je s solo-recitali na pomembnih festivalih in koncertnih prizoriščih v mestih, kot so Berlin (Konzerthaus), Frankfurt (Alte Oper), Herne (Tage der Alten Musik), Köln (WDR), München (Gasteig), Brugge (Festival van Vlaanders), Cannes, Dijon, Festival de Nice, Lausanne, Zürich (Tonhalle), Granada, Palma de Mallorca, Madrid, Fano, Pesaro, Benetke, Neapelj (dvorana Scarlatti), Alessano (Festival il Montesardo), Varaždin (Baročne večeri), San Francisco, Berkeley, Los Angeles (Chamber Hall), Passadena in mnogi drugi. " +
    "Kritiki so ga označili kot enega najpomembnejših čembalistov in poznavalcev repertoarja za čembalo, posebej glasbe Domenica Scarlattija. Kot organist se je specializiral za interpretacijo italijanske, španske in francoske glasbe od 16. do 18. stoletja. " +
    "Kot dirigent ansambla Compagnie Fontainebleau vodi od leta 1994 baročne opere in sakralno glasbo Monteverdija, De Lalanda, Charpentierja, Lullyja, Rameauja, Haendla in Telemanna. Dirigiral je tudi znamenitim orkestrom, med njimi Berlin Baroque in Züricher Kammerorchester. " +
    "Snemal je za založbe Marc Aurel Edition, Cybele, Zenon in Moeck, sodeloval pa je tudi pri radijskih in televizijskih produkcijah ter koncertnih prenosih (BBC, BR, HR, SWF, RBB, Deutschland Radio, RTV Slovenija, TVCG, HRT, RTS). " +
    "Kot docent in gostujoči profesor za čembalo, historične inštrumente s tipkami in staro glasbo je poučeval na visokošolskih ustanovah in akademijah v Würzburgu (1998–2000), Nürnbergu (2001), na Cetinju (2002–2003), v Ferrari (2006) in Pesaru (2006–2008). Od leta 2009 je habilitirani docent za čembalo na Akademiji za glasbo v Ljubljani. " +
    "Sodeloval je tudi kot član žirij na evropskih nacionalnih in mednarodnih tekmovanjih, med njimi Jugend musiziert, italijanskem nacionalnem in mednarodnem tekmovanju za čembalo G. Gambi v Pesaru (2006–2011) ter UNESCO-vem svetovnem tekmovanju za pevce L'Orfeo v Veroni (2007)."
},

    {
      name: "Branimir Rezić - MENTOR",
      role: "Glasbenik, pedagog, notograf, skladatelj",
      instruments: "Čembalo, klavir",
      image: braneImage,
      shortBio: "Dodiplomsko izobraževanje je zaključil na Umjetničkoj akademiji u Splitu (UA Split), smer glasbena teorija. Na Akademiji za glasbo (AG LJ) je magistriral na smereh sakralna glasba in zborsko dirigiranje ter čembalo pri prof. Egonu Mihajloviću (AG LJ). ",
      fullBio: `
Branimir Rezić je uveljavljen skladatelj, dirigent in čembalist, rojen 1989 v Zagrebu. Svojo umetniško pot je začel že kot mlad glasbenik in se hitro uveljavil na področju zgodovinske glasbe. Njegova dela so bila večkrat nagrajena; med drugim je osvojil drugo nagrado na Samoborskem zborskem protuletju (2011, 2013) ter nagrado za najboljšo skladbo mladih skladateljev na XVII. Danih duhovne glasbe "CRO PATRIA" za delo "Oče naš". Njegove skladbe so bile večkrat izvedene na festivalih in prireditvah v Sloveniji in na Hrvaškem, prejele pa so tudi priznanja Hrvatskega sabora kulture.

Kot čembalist in asistent dirigenta je sodeloval pri pomembnih projektih baročne glasbe, vključno z izvedbami Monteverdijevih "Vesperae della beata Mariae virginis" in "Incoronazione di Poppea", ter pri festivalih, kot so Les Fêtes Musicales de Versailles. Aktivno je sodeloval z baročnim orkestrom in ansambli Akademije za glasbo v Ljubljani ter SNG Maribor.

Njegovo vodstvo in pedagoško delo zajema številne ansamble, od ženskih in moških zborov do pihalnih orkestrov, tako na Hrvaškem kot v Sloveniji. Je tudi korepetitor in umetniški svetovalec na festivalih in projektih stare glasbe, kjer združuje izvajalsko odličnost z mentoringom mlajših glasbenikov. Branimir je prepoznan kot ena vodilnih osebnosti pri ohranjanju in interpretaciji baročne in sakralne glasbe v regiji.

Poleg mentorstva in dirigiranja aktivno nastopa kot čembalist ter sodeluje pri projektih digitalizacije notnih arhivov in ohranjanja evropske glasbene dediščine.
`

    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-6 text-accent text-center">
          ČLANI IN MENTORJI DRUŠTVA
        </h1>
        <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
          Član Nove akademije lahko postane vsak, ki se ljubiteljsko ali profesionalno ukvarja s staro glasbo.
          Nekateri člani so mednarodno izobraženi slovenski glasbeniki, ki prinašajo svež 
          zagon in nove ideje na slovensko sceno stare glasbe.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {members.map((member, index) => (
            <Card 
              key={index} 
              className="p-8 bg-card border-border hover:border-accent transition-colors cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-accent mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm font-semibold text-foreground mb-2">
                      {member.role}
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      {member.instruments}
                    </p>
                  </div>
                  <Avatar className="h-16 w-16 border-2 border-accent">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {member.shortBio}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-20 w-20 border-2 border-accent">
                  <AvatarImage src={selectedMember?.image} alt={selectedMember?.name} />
                  <AvatarFallback>{selectedMember?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl text-accent">{selectedMember?.name}</DialogTitle>
                  <p className="text-sm font-semibold text-foreground">{selectedMember?.role}</p>
                  <p className="text-sm text-muted-foreground italic">{selectedMember?.instruments}</p>
                </div>
              </div>
            </DialogHeader>
            <DialogDescription className="text-foreground whitespace-pre-line leading-relaxed">
              {selectedMember?.fullBio}
            </DialogDescription>
          </DialogContent>
        </Dialog>

        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => window.location.href = '/o-nas'}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            VČLANITE SE
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Members;
