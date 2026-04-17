export interface Member {
  slug: string;
  name: string;
  role: string;
  instruments: string;
  imageKey: string; // ujema se s ključem v imageMap v komponentah
  shortBio: string;
  fullBio: string;
  isMentor?: boolean;
}

export const members: Member[] = [
  {
    slug: "urban-klancar",
    name: "Urban Klančar",
    role: "Glasbenik, organizator",
    instruments: "Baročna oboa, kljunaste flavte, baročni fagot, dulcian, čembalo",
    imageKey: "urban-klancar",
    shortBio: "Na Akademiji za glasbo (AG LJ) je dokončal diplomski študij pri doc. Mateji Bajt, magistrski študij kljunaste flavte pa je nadaljeval pri prof. Mattijsu Lunenburgu in Maruši Brezavšček. Trenutno na Univerzi za glasbo in uprizoritvene umetnosti Gradec (KUG) študira pri prof. Amy Power historične pihalne inštrumente.",
    fullBio: "Urban Klančar je študiral kljunasto flavto na Konservatoriju za glasbo " +
      "in balet in študij kljunaste flavte je nadaljeval na Akademiji za glasbo v Ljubljani. " +
      "Magistrski študij je nadaljeval na isti ustanovi, sočasno pa se je vpisl na dodiplomski študij " +
      "baročne oboe na Univerzi za glasbo in upodabljajočo umetnost Gradec. Kot solist in v komorni skupini " +
      "se je udeležil slovenskega državnega tekmovanja TEMSIG in prejel številne nagrade. Kot profesionalni glasbenik bi raje igral v komornih skupinah ter širil zanimanje za staro glasbo med mlajše generacije. Med študijem je igral v različnih glasbenih komornih zasedbah ter sodeloval na številnih uradnih dogodkih v predsedniški palači, Ministrstvu za izobraževanje, Inštitutu Joseph Stefan in drugi. Z renesančno glasbo je skupaj s kolegi nastopal na številnih samostojnih koncertih na gradu Bogenšperk, v samostanu Mekinje in v cerkvi sv. Pavla v Radovljici, koncertnih ciklih Solo e da camera in Glasbena mladina Ljubljanska. Redno sodeluje z Slovenskim baročnim orkestrom, Glasbeno matico Ljubljana, ter drugimi priložnostnimi skupinmi v Sloveniji. V mednarodnih projektih je z igranjem na baročno oboo že nastopil na Dunaju, v Gradcu, Linzu in Salzburgu. Leta 2024 je sodeloval pri projektu Erasmus Fireworks for Europe, ki ga vodita Paolo Grazzi in Alfredo Bernardini, dva izmed članov svetovno znanega ansambla Zefiro, specializiranega za baročni repertoar. Z znanim dirigentom Ernstom Wedamom je izvedel Weichnachtsoratorium z dunajskimi Bachsolisti v Wienerkonzerthausu. Med študijem se je naučil igrati na različna baročna in renesančna glasbila. Dobro obvlada igranje na različne velikosti baročnih flavt ter igranje v consortu flavt. S študijem v Gradcu se je naučil igrati na različne velikosti oboe, dulzianov, in šalmajev. Poleg rednega študija se še dodatno izobražuje na številnih mojstrskih tečajih pri številnih znanih profesorjih, kot so Andreas Böhlen, Tabea Schwartz, Lea Sobbe, Stefano Bet, Anne-Susse Enßle, Bettina Simon, Alfredo Bernardini, Adrian Brown in drugi.",
  },
  {
    slug: "laura-calligaris",
    name: "Laura Calligaris",
    role: "Glasbenica",
    instruments: "Violina",
    imageKey: "laura-calligaris",
    shortBio: "V razredu prof. Priye Mitchell (KUG) je zaključila diplomski študij violine, sedaj pa je vpisana k prof. Philippu Graffinu na Kraljevi univerzi v Bruslju (KCB). Pri prof. Lucii Froihofer-Graber (KUG) se je izpopolnjevala na baročni violini.",
    fullBio: "Violinistka Laura Calligaris, rojena leta 2002, je z igranjem violine začela s petimi leti pri prof. Roku Zgoncu. Od leta 2015 se je violino učila pri prof. Idi Bieler na Visoki šoli za glasbo in upodabljajoče umetnosti v Gradcu, leta 2017 pa se je vpisala na umetniško gimnazijo Konservatorija za glasbo in balet Maribor, kjer jo je violino učila prof. Vesna Čobal. Je dobitnica nagrade \"Dr. Romana Klasinca\" konservatorija Maribor za leto 2021. Prejela je tudi več priznanj na državnih in mednarodnih tekmovanjih; na TEMSIG-u leta 2018 dvojno zlato plaketo (violina, solfeggio), leta 2020 zlato plaketo in tretjo nagrado s klavirskim triom Libero in leta 2021 kot solistka zlato plaketo in tretjo nagrado. Na mednarodnem tekmovanju Svirel leta 2016 in 2017 zlato plaketo, na tekmovanju Leona Pfeifferja leta 2016 pa drugo nagrado. Februarja 2023 je osvojila 3. nagrado (1. ni bila podeljena) v kategoriji do 32 let, na tekmovanju VIII Agustín Aponte International Music Competition na Tenerifih, Španija. Kot solistka je leta 2017 s Komornim orkestrom slovenskih solistov dvakrat izvedla Mozartov violinski koncert v D-duru, leta 2018 pa je nastopila kot solistka z orkestrom Konservatorija Maribor, s katerim je izvedla Bachov dvojni violinski koncert v d-molu. Leta 2021 je bila sprejeta na Visoko šolo za glasbo in upodabljajoče umetnosti v Gradcu, kjer je z odliko diplomirala v razredu profesorice Priye Mitchell. Oktobra 2024 sta s pianistom Andreyem Ilienkom nastopila v sklopu ciklusa \"32. Mladi virtuozi\" Festivala Ljubljana. Od septembra 2025 je vpisana v razred Philippa Graffina na Kraljevi univerzi v Bruslju. Igra tudi baročno violino ter je soustanoviteljica društva za baročno glasbo Nova Akademija.",
  },
  {
    slug: "barbara-kepic",
    name: "Barbara Kepic",
    role: "Glasbenica, pedagoginja",
    instruments: "Violončelo",
    imageKey: "barbara-kepic",
    shortBio: "Na Akademiji za glasbo (AG LJ) je zaključila diplomski in magistrski študij pri prof. Karmen Pečar Koritnik, prof. Eldarju Saparayevu in njegovim asistentom g. Sebastianom Bertoncljem. Dodatno se izpolnjuje na baročnem čelu pri prof. Kaji Kapus (AG LJ).",
    fullBio: "Barbara Nagode se je violončelo pričela učiti na Glasbeni šoli Moste-Polje pri prof. Kseniji Trotovšek Brlek in Katji Beguš-Bobek. Srednješolsko izobraževanje je zaključila na ljubljanskem Konservatoriju za glasbo pri prof. Karmen Pečar Koritnik, pri kateri je nadaljevala tudi dodiplomski študij na Akademiji za glasbo v Ljubljani, sedaj pa svoj študij razvija pod mentorstvom prof. Eldarja Saparayeva in njegovim asistentom g. Sebastianom Bertoncljem. Redno obiskuje mojstrske tečaje pri priznanih pedagogih (Giovanni Gnocchi, Thomas Carroll, Konradin Brotbek, Dragan Đorđević, Reinhard Latzko, Domen Marinčič, Stephan Braun, Matz Lidstrom, Thomas Platzgummer, Enrico Dindo, Julian Steckel) in je nagrajenka slovenskega državnega tekmovanja TEMSIG. Zlate plakete je prejela tudi na drugih mednarodnih tekmovanjih po Italiji v Trevisu, Povolettu itd. Prav tako gostuje doma in po tujini z različnimi komornimi zasedbami. V letu, ki je bilo močno zaznamovano s pandemijo Covid19, je bila na Akademiji na oddelku violončelistov, posebej izbrana za projekt v Cankarjevem domu, kjer so skupaj s komornim glasbenim gledališčem, na slovenskih tleh, izvedli krstno izvedbo Leonarda Bernsteina operete Candid, ki se je močno pozitivno utrla poslušalcem in javnim kritikom. Zadnja tri leta pod mentorstvom prof. Mihe Haasa, deluje v triu Plamen, s katerim so osvojile zlate plakete na državnih in mednarodnih tekmovanjih ter obiskale mednarodni Festival v Firencah v letu 2023. Poleg klasičnega učenja violončela dodatno izobražuje tudi na področju stare glasbe-baročno čelo, ki odpira nova znanja pri izvajalski praksi, pri profesorici Kaji Kapus. Od leta 2021/22 je tudi štipendistka MOL za nadarjene dijake/študente. V letošnjem letu (2024) je uspešno opravila avdicijo v simfoničnem orkestru Mariborske opere ter s septembrom nastopila z delom. Barbara je ena izmed soustanoviteljic društva Nova akademija in redna članica njihovega ansambla.",
  },
  {
    slug: "marie-tuhtan",
    name: "Marie Tuhtan",
    role: "Glasbenica, pedagoginja, korepetitorka",
    instruments: "Čembalo, klavir",
    imageKey: "marie-tuhtan",
    shortBio: "Na Akademiji za glasbo (AG LJ) je 2024 diplomirala iz klavirja pri prof. Vladimirju Mlinariću, trenutno nadaljuje študij klavirske pedagogike v razredu prof. Sae Lee. Vpisana je tudi na umetniški program čembalo pri prof. Egonu Mihajloviću (AG LJ).",
    fullBio: "Marie Tuhtan prihaja iz v Reke na Hrvaškem. Klavir igra od svojega petega leta, osnovno glasbeno izobrazbo pa je dobila pri prof. Ivoni Šarčević, pri kateri je obiskovala tudi srednjo glasbeno šolo. Leta 2024 je diplomirala iz klavirja pri prof. Vladimirju Mlinariću na Akademiji za glasbo (AG LJ), kjer trenutno nadaljuje študij klavirske pedagogike pri prof. Sae Lee in umetniško smer čembala pri prof. Egonu Mihajloviću. Marie je pianistka in čembalistka, ki nastopa solistično, v komornih zasedbah in kot spremljevalka pevcev, inštrumentalistov, zborov in orkestrov. Obiskuje različne seminarje za klavir in čembalo, pri katerih še dodatno poglablja svoje glasbeno izražanje. Je prejemnica številnih nagrad iz tekmovanj Sonus, HDGPP, mednarodnega pianističnega tekmovanja v Zagrebu in Smederevu. Trenutno je članica društva Nova Akademija, ki se osredotoča za staro glasbo, kjer sodeluje v različnih ansamblih in poglobljeno raziskuje zgodovinsko interpretacijo različnega repertoarja. Še posebej se osredotoča na igranje basso continua. Poleg tega sodeluje skupaj s svojo družino kot glasbena družina Tuhtan, s katero nastopa z opernim in sakralnim programom. Trenutno kot pianistka in čembalistka sodeluje v duu Impulso z violinistko Natalijo Ljubotino. Od leta 2023 poučuje klavir in deluje kot korepetitorka na Glasbeni šoli Amarilis.",
  },
  {
    slug: "paulina-tuhtan",
    name: "Paulina Tuhtan",
    role: "Glasbenica",
    instruments: "Violina",
    imageKey: "paulina-tuhtan",
    shortBio: "V Rijeki je zaključila srednjo glasbeno šolo v razredu prof. Maje Veljak. Trenutno je študentka 4. letnika Akademije za glasbo Univerze v Zagrebu (MUZA) v razredu prof. Susanne Yoko Henkel, kjer sodeluje v več baročnih projektih.",
    fullBio: "Paulina Tuhtan je hrvaška violinistka, ki jo še posebej zanima baročna glasba. Violino je začela igrati pri petih letih, nadaljnje izobraževanje pa je opravljala na Osnovni in Srednji glasbeni šoli Ivana Matetića Ronjgova v Reki v razredu prof. Maje Veljak. V srednji šoli se je njeno zanimanje za baročni repertoar poglobilo z igranjem v baročnem komornem ansamblu prof. Laure Vadjon. Trenutno je študentka 4. letnika Akademije za glasbo Univerze v Zagrebu v razredu prof. Susanne Yoko Henkel. Redno nastopa v orkestralnih in komornih projektih, pogosto skupaj s sestro Marie Tuhtan ter sodeluje s kolegi iz akademije in muzikologi. Povabljena je bila tudi na kolegij \"Baročna glasba\", namenjen muzikologom, kjer je združevala izvajanje in raziskovalno delo. Je prejemnica rektorjeve nagrade za sodelovanje pri pripravi in izvedbi opere Hippolyte et Aricie skladatelja J. P. Rameaua pod vodstvom Franja Bilića, nastopila pa je tudi na izvedbah Te Deum M.A. Charpentierja in izrezkov iz Hippolyte et Aricie pod vodstvom priznanega baročnega dirigenta Hervéja Niqueta. Skozi igranje si prizadeva poglabljati razumevanje in interpretacijo stare glasbe ter razvijati sodelovanje s kolegi in muzikologi.",
  },
  {
    slug: "natalija-ljubotina",
    name: "Natalija Ljubotina",
    role: "Glasbenica, pedagoginja",
    instruments: "Violina",
    imageKey: "natalija-ljubotina",
    shortBio: "Na Akademiji za glasbo Ljubljana (AG LJ) je v razredu prof. Volodje Balžalorskega zaključila študij violine. Trenutno poučuje na Glasbenem centru Edgar Willems in na glasbeni šoli Lartko, poleg pedagoškega dela pa se aktivno udejstvuje tudi na koncertnem področju, med drugim v baročnih projektih.",
    fullBio: "Natalija Ljubotina je z igranjem violine začela pri sedmih letih v razredu prof. Plamenke Dražil. Srednješolsko glasbeno izobrazbo je opravila na Konservatoriju za glasbo in balet v Ljubljani (KGBL) pri prof. Arminu Sešku. Leta 2019 je bila sprejeta na Akademijo za glasbo Ljubljana (AG LJ) v razredu prof. Volodje Balžalorskega, kjer je leta 2025 uspešno zaključila študij. Trenutno poučuje violino na različnih glasbenih šolah, obenem pa tudi sodeluje pri koncertih v različnih zasedbah, med katerimi pomembno mesto zavzemajo tudi baročni projekti. Leta 2018 je kot solistka in udeleženka festivala Amadeo nastopila z orkestrom Amadeo pod vodstvom Tilna Drakslerja, leto kasneje pa je sodelovala v Slovenskem mladinskem orkestru. Leta 2022 je prejela štipendijo za udeležbo mojstrskega tečaja festivala Ljubljana pri Lani Trotovšek, januarja 2023 pa je delovala kot substitutka v Simfoničnem orkestru SNG Opera in balet Ljubljana. V sklopu udeležb mojstrskih tečajev in poletnih seminarjev je večkrat nastopila v Sloveniji, na Hrvaškem in v Avstriji. V študijskem letu 2023/2024 se je udeležila študijske izmenjave na Conservatorio Superior de Música Manuel Castillo v Sevilli pri prof. Eleni Fernández González, v tem času pa tudi sodelovala z orkestri po Španiji, med drugim pri izvedbi dela H. Eslava: Miserere v katedrali v Sevilli. Posebno pozornost namenja komornemu muziciranju in historično informirani izvedbi. Sodeluje v duu s pianistko in čembalistko Marie Tuhtan, njeno poglobljeno zanimanje za staro glasbo pa jo je spodbudilo k sodelovanju v društvu Nova Akademija, katerega članica je postala leta 2025.",
  },
  {
    slug: "erazem-zganjar",
    name: "Erazem Žganjar",
    role: "Glasbenik",
    instruments: "Kljunaste flavte, baročni fagot",
    imageKey: "erazem-zganjar",
    shortBio: "Na Konservatoriju za glasbo in balet Ljubljana (KGBL) je zaključil izobraževanje na kljunasti flavti in prejel Škerjančevo nagrado za izjemne umetniške dosežke. Na Univerzi Mozarteum Salzburg (MOZ) nadaljuje podiplomski študij koncertne smeri pri prof. Dorothee Oberlinger.",
    fullBio: "Erazem Žganjar (r. 2002) je slovenski izvajalec na kljunasti flavti, ki trenutno opravlja podiplomski študij koncertne smeri na Univerzi Mozarteum Salzburg pri svetovno priznani flavtistki Dorothee Oberlinger. Je štirikratni dobitnik prve nagrade in zlate plakete na slovenskem državnem tekmovanju TEMSIG ter prvi kljunasti flavtist, ki je postal zmagovalec razpisa Mladi upi za izjemno nadarjene mlade umetnike, športnike in znanstvenike. Prav tako je bil šele drugi kljunasti flavtist, ki je med izobraževanjem na Konservatoriju za glasbo in balet Ljubljana prejel Škerjančevo nagrado za izjemne umetniške dosežke. Kot solist in komorni glasbenik je nastopil na številnih pomembnih festivalih in koncertnih ciklih, med drugim na Festivalu Ljubljana, Festivalu Radovljica, Forumu Blockflöte v Nürnbergu, Festivalu ORA v Salzburgu, Slovenskih glasbenih dnevih ter ciklu Solo e da Camera. Nastopil je z baročnim orkestrom in vokalnim ansamblom Univerze Mozarteum ter s Centrom za baročno glasbo Versailles, redno pa sodeluje tudi s sodobnimi slovenskimi in tujimi skladatelji ter izvaja premiere njihovih del. Med njegove najnovejše dosežke sodijo solistični koncerti na Inštitutu za novo glasbo Univerze Mozarteum ter na Tednu sodobne glasbe na Bledu v organizaciji Inštitut.abeceda, kjer je deloval kot umetniški vodja ansambla kljunastih flavt. Januarja 2026 je skupaj z Dorothee Oberlinger nastopil v Dunajskem Konzerthausu. Aprila bo izvedel celovečerni koncert kot solist in umetniški vodja z baročnim orkestrom na Festivalu baročne glasbe v St. Johannu.",
  },
  {
    slug: "ana-birsa-krusec",
    name: "Ana Birsa Krušec",
    role: "Glasbenica, pedagoginja",
    instruments: "Kljunaste flavte",
    imageKey: "ana-birsa",
    shortBio: "Leta 2022 je zaključila dodiplomski študij na Akademiji za glasbo (AG LJ) pri doc. Mateji Bajt. Magistrski študij kljunaste flavte je maja 2025 zaključila pri Maruši Brezavšček, del študija pa je opravila tudi na Konservatoriju v Amsterdamu (CvA) pri prof. Jorgu Isaacu. Trenutno poučuje na Glasbenem centru Edgar Willems.",
    fullBio: "Ana Birsa Krušec (2000) je glasbeno pot začela leta 2007 na Glasbeni šoli Koper, podružnici Izola, v razredu Dušana Kitića. S petnajstimi leti je šolanje nadaljevala na Konservatoriju za glasbo in balet v Ljubljani pri prof. Mateji Bajt, pod njenim mentorstvom pa je leta 2022 uspešno zaključila tudi dodiplomski študij na Akademiji za glasbo v Ljubljani. V tem obdobju je na državnih tekmovanjih TEMSIG osvojila tri zlata priznanja, dve prvi nagradi ter posebno nagrado za doseženih 100 točk. Magistrski študij je zaključila maja 2025 pri profesorici Maruši Brezavšček. Istega leta je bila na študijski izmenjavi na Konservatoriju v Amsterdamu, kjer se je izpopolnjevala v razredu prof. Jorga Isaaca ter poglobila svoje znanje sodobne in stare glasbe. Redno se izobražuje na mojstrskih tečajih pri mednarodno priznanih izvajalcih, kot so Matthijs Lunenburg, Stefano Bagliano, Inês d'Avena, Susanna Borsch, Andreas Böhlen, Hester Groenleer in drugi. Dejavno koncertira v različnih zasedbah, med drugim v duu Štefana, srednjeveški skupini Cappella Justinopolitana, duu Iter Musici, v priložnostnih baročnih orkestrih ter kot solistka. Nastopila je na uglednih koncertnih ciklih, kot so Glasbena mladina ljubljanska, Solo e da camera, GM Oder, Mladi virtuozi in Sakralni abonma.",
  },
  {
    slug: "livija-zagar",
    name: "Livija Žagar",
    role: "Glasbenica, mladinska delavka",
    instruments: "Violina, viola",
    imageKey: "livija-zagar",
    shortBio: "Na Konservatoriju za glasbo in balet Ljubljana (KGBL) je violino študirala v razredu prof. Armina Seška. V Celovcu je na Gustav Mahler Privatuniversität für Musik (GMPU) zaključila študij violine pri prof. Christianu Tacheziju.",
    fullBio: "Livija Žagar je po končani nižji glasbeni šoli pri prof. Poloni Češarek šolanje nadaljevala na Konservatoriju za glasbo in balet Ljubljana pri prof. Arminu Sešku. Študij violine je zaključila na Gustav Mahler Privatuniversität für Musik v Celovcu. Znanje violine je izpopolnjevala pri prof. Arminu Sešku, prof. Vesni Stanković-Moffatt, prof. Tatyani Balashovi, prof. Helfriedu Fistru, prof. Anki Schittenhelm, prof. Wonji Kim-Ozim in prof. Benjaminu Schmidu. S komornim sestavom se je izobraževala na Associazione Musicale e Culturale di Farra d'Isonzo – Gorizia, Seminari Internationali di Musica da Camera Alpe-Adria. Leta 2024 se je kot violistka udeležila Stellenbosch International Chamber Music Festival v Južni Afriki. V študijskem letu 2024/25 je na Gustav Mahler Privatuniversität für Musik sodelovala pri baročnem projektu, kjer so pod vodstvom Klausa Kuchlinga premierno izvedli opero »Penelope«, skladatelja Francesca Bartholomea Contija. Sodelovala je tudi pri projektu Zven veličastja skupaj z APZ France Prešeren in Orkestrom Nova akademija ter s Slovenskim baročnim orkestrom pri projektu Gloria in excelsis Deo.",
  },
  {
    slug: "domen-gvozdanovic",
    name: "Domen Gvozdanović",
    role: "Glasbenik, skladatelj",
    instruments: "Kitara, teorba",
    imageKey: "domen-gvozdanovic",
    shortBio: "Na Konservatoriju za glasbo in balet Ljubljana (KGBL) se je izobraževal v razredih profesorjev Mladena Bucića in Jerka Novaka. Leta 2022 je bil sprejet na Akademijo za glasbo v Ljubljani (AG LJ), kjer študira kitaro pri prof. Tomažu Rajteriču.",
    fullBio: "Domen Gvozdanović je svojo glasbeno pot začel na nižji stopnji Konservatorija za glasbo in balet Ljubljana pod mentorstvom prof. Mladena Bucića, šolanje pa nadaljeval na srednji stopnji pri prof. Jerku Novaku. Leta 2022 je bil sprejet na Akademijo za glasbo v Ljubljani, kjer študira kitaro pri prof. Tomažu Rajteriču. Po končanem dodiplomskem študiju načrtuje magistrski študij v tujini. Kot kitarist sodeluje v različnih komornih sestavih (glas–kitara, flavta–kitara, viola–kitara) ter je član etno-folk skupine propertea, ki izvaja glasbo različnih svetovnih tradicij, vključno z irsko, balkansko, južnoameriško, dansko in predvsem slovensko glasbo. V preteklem letu je kot teorbist sodeloval v baročnem orkestru Akademije za glasbo in nastopil v operi »Kronanje Popeje« skladatelja Claudia Monteverdija. V okviru koncertnega cikla Solo e da camera je sodeloval pri projektu »Zefiro torna« pod vodstvom prof. Egona Mihajlovića. Na Gimnaziji Kranj in kasneje v cerkvi sv. Trojice v Ljubljani je skupaj z baročnim orkestrom Nova akademija in Akademskim pevskim zborom France Prešeren izvedel Charpentierjev »Te Deum«. V božičnem času je v stolnici sv. Nikolaja sodeloval pri izvedbi Bachove kantate »Gloria in excelsis Deo« ter prvega dela Händlovega »Mesije«.",
  },
  {
    slug: "jakob-istenic",
    name: "Jakob Istenič",
    role: "Glasbenik",
    instruments: "Kontrabas, tuba, ukulele, petje",
    imageKey: "jakob-istenic",
    shortBio: "Na Konservatoriju za glasbo in balet Ljubljana (KGBL) se s kontrabasom izobražuje na oddelku za jazz, kot pevec pa deluje v Komornem zboru De profundis Kranj.",
    fullBio: "Kontrabasist Jakob Istenič je svoje glasbeno izobraževanje začel v Glasbeni šoli Kranj. Tam je igral tudi na tubo in redno sodeloval pri koncertih s Tuba božički. Poleg študija fizike se je odločil za poglobljeno glasbeno izobraževanje na področju jazza. Na Konservatoriju za glasbo in balet Ljubljana se s kontrabasom izobražuje na oddelku za jazz. Svoj pevski talent pa redno udejstvuje kot član Komornega zbora De profundis Kranj, ki deluje pod vodstvom Branke Potočnik Krajnik. Z zborom je sodeloval pri poustvarjanju stare glasbe na koncertih in projektih, posvečenih srednjeveškemu in sakralnemu repertoarju. Nastopal je v okviru projektov Odmevi srednjega veka, Grajske zgodbe, Božični čas, v sklopu sakralnega abonmaja v cerkvi Svete Trojice ter drugih projektih in nastopih. Prav tako je sodeloval na koncertu Zven veličastja z Akademskim pevskim zborom France Prešeren znotraj baročnega orkestra Nova Akademija.",
  },
  {
    slug: "lovro-tavcar",
    name: "Lovro Tavčar",
    role: "Glasbenik",
    instruments: "Trobenta, baročna trobenta",
    imageKey: "lovro-tavcar",
    shortBio: "Na Konservatoriju za glasbo in balet Ljubljana (KGBL) je s trobento pri prof. Matjažu Jevšnikarju zaključil srednješolsko izobraževanje, trenutno pa študira na Akademiji za glasbo v Ljubljani (AG LJ) pri prof. Juretu Gradišniku.",
    fullBio: "Lovro Tavčar je trobento začel igrati pri sedmih letih na Glasbeni šoli Franza Šturma pri prof. Martinu Dukariću. Šolanje je nadaljeval na Konservatoriju za glasbo in balet Ljubljana pri prof. Matjažu Jevšnikarju, trenutno pa študira na Akademiji za glasbo v Ljubljani pri prof. Juretu Gradišniku. Kot solist in komorni glasbenik je prejemnik več zlatih priznanj in prvih nagrad na državnih in mednarodnih tekmovanjih (TEMSIG, Euritmia, Svirel, PaMus Flow, WoodWind Brass, University Brass Competition). Že večkrat je sodeloval kot substitut v Simfoničnem orkestru RTV Slovenija, Orkestru SNG Opera in balet Ljubljana ter v mednarodnem orkestru FVG v Italiji. S Trobilnim ansamblom Akademije za glasbo UL je na RTV Slovenija posnel CD zgoščenko (2024). Je član trobilnega kvinteta FiveBrass. Skupina je nastopila in sodelovala na številnih festivalih in koncertnih ciklih doma ter v tujini, kot so Imago Sloveniae, Glasbena mladina ljubljanska, Festival Ljubljana, Music System Italy, Solo e da camera in mnogi drugi. Leta 2025 so na državnem tekmovanju TEMSIG osvojili prvo nagrado in zlato plaketo s posebnim priznanjem za obvezno skladbo. Udeležil se je mojstrskih tečajev pri priznanih trobentačih, kot so Gábor Tarkövi, Jeroen Berwaerts, Marco Pierobon, Roman Rindberger in drugi. V zadnjem času pa posebno pozornost namenja tudi raziskovanju baročne trobente in izvajanju stare glasbe. Na Gimnaziji Kranj ter pozneje v cerkvi sv. Trojice v Ljubljani je skupaj z baročnim orkestrom Nova akademija in Akademskim pevskim zborom France Prešeren izvedel Charpentierjev Te Deum. Z namenom poglobiti svoje znanje ter prispevati k razvoju in prepoznavnosti baročne trobente v Sloveniji se je pridružil društvu Nova Akademija.",
  },
  // === MENTOR ===
  {
  slug: "mojca-jerman",
  name: "Mojca Jerman",
  role: "Glasbenica",
  instruments: "Baročna violina",
  imageKey: "mojca-jerman",
  isMentor: true,
  shortBio: "Študij baročne violine je zaključila na Konservatoriju v Bologni pri Enricu Gattiju, izobraževala pa se je tudi v Ljubljani (AG LJ), Celovcu (GMPU) in Gradcu (KUG). Svoje znanje nadgrajuje pod mentorstvom violinista Luce Giardinija.",
   fullBio: `Mojca Jerman je violinistka, ki se v veliki meri posveča historičnemu izvajanju glasbe.

    Glasbeno se je izobraževala v Ljubljani, Celovcu, Gradcu in Bologni. Baročno violino je doštudirala pri Enricu Gattiju, na glasbenem Konservatoriju v Bologni. Zadnja leta nadgrajuje svoje znanje pod mentorstvom violinista in pedagoga Luce Giardinija.

    S svojimi komornimi zasedbami je osvojila več nagrad in priznanj, v zadnjih letih je aktivna v zasedbi Nocturnalia, baročnem triu, katere prioriteta je izvajanje glasbe 17. in 18. stoletja, predvsem odkrivanje neznanega repertoarja in kreiranje tematsko zanimivih, raziskanih in zaokroženih programov, ki v publiki pustijo trajen učinek. So ena od zasedb, ki jih v letih 2026/27 podpira organizacija Eeemerging. Pred tem so bili izbranci sheme BREMF Young Artist, nastopali pa so na festivalih BREMF (Brighton Early Music Festival), Festival Tartini v Ljubljani, Contratemps, Festival Oudek Utrecht in drugje.

    Kot solistka, komorna glasbenica in članica raznih orkestrov (Insula, Anima Eterna, Frau Musika) nastopa po vsej Evropi.`
  },
  {
  slug: "luka-posavec",
  name: "Luka Posavec",
  role: "Glasbenik, organolog",
  instruments: "Orgle, čembalo",
  imageKey: "luka-posavec",
  isMentor: true,
  shortBio: "Študij orgel je opravil na Visoki šoli za glasbo Franz Liszt v Weimarju pri prof. Martinu Sturmu, kjer je zaključil magistrski študij, ter na Visoki šoli za glasbo v Würzburgu pri prof. Ralfu Waldnerju, kjer je diplomiral iz historičnih inštrumentov – čembala.",
  fullBio: `Kot certificiran orgelski strokovnjak Luka sledi svoji viziji povezovanja zgodovine in orgelske glasbene kulture. Njegova strast je razkrivanje zakladnice znanj in veščin starih mojstrov ter z njimi povezanih zgodb iz preteklosti. V dediščini prednikov odkriva korenine sodobne kulture in temelje njene prihodnosti.

  Luka je učenje orgel pričel leta 2011 pri prof. Poloni Gantar na Orglarski šoli ljubljanske Teološke fakultete, od 2014 do 2017 pa ga nadgrajeval pri prof. Tomažu Sevšku Šramelu. Leta 2017 je pričel študij orgel v razredu prof. dr. c.h. Christopha Bosserta na Visoki šoli za glasbo v Würzburgu. Leta 2024 je zaključil magistrski študij orgel na Visoki šoli za glasbo Franz Liszt v Weimarju pri prof. Martinu Sturmu, leta 2025 pa diplomski študij historičnih inštrumentov – čembala na Visoki šoli za glasbo v Würzburgu pri prof. Ralfu Waldnerju. Jeseni leta 2025 je zaključil tudi študij cerkvene glasbe (Diplom Kirchenmusiker A) na Visoki šoli za glasbo Franz Liszt v Weimarju pri prof. Martinu Sturmu.

  Kot organist in dirigent je svoje prve izkušnje pridobival v samostanu Stična, kjer je pet let vodil zbor Chorus Sitticensis. Je tudi soustanovitelj in prvi predsednik kulturnega društva Musica Basilicae Sitticensis Stična.

  Udeležuje se mojstrskih orgelskih seminarjev doma in v tujini, prepoznaven pa postaja tudi kot predavatelj. Tako je bil npr. kot predavatelj povabljen na Orglarsko šolo v Ljubljani, Akademijo za glasbo Univerze v Ljubljani, na Poletno orgelsko šolo v Šibeniku in Varaždinu … Kot certificiran orgelski izvedenec je danes član več komisij za gradnjo novih ali obnovo starih orgel.

  Luka je soustanovitelj (2024) in umetniški vodja orgelskega cikla »Zvočne impresije romantike z domačimi in tujimi virtuozi« v župniji Šentvid pri Stični. Poleg tega je član Slovenskega orgelskega društva in sodelavec pri promociji projekta Orglekids Slovenija.

  V okviru projekta Organistica, katerega soustanovitelj je bil leta 2022, si je zadal cilj vzpostavitve sistema dokumentiranja in vrednotenja slovenskih zgodovinskih orgel ter posledično njihovo zavarovanje. Vse to pridobiva vse večji pomen tako pri slovenski kot tudi tuji strokovni javnosti.

  S pridobljeno strokovno usposobljenostjo in nivojem izobrazbe želi Luka v slovenskem prostoru zapolniti vrzel manjkajočega znanja na področju organologije ter pri strokovni javnosti dvigniti raven spoštovanja in ohranjanja dragocene kulturne dediščine zgodovinskih orgel. S svojim profesionalnim odnosom bi rad prispeval k spodbujanju in oblikovanju razvoja slovenske orgelske kulture. Njegova ambicija za prihodnost je vzpostavitev sistema kakovostnega izobraževanja na področju organologije, v okviru katerega bi strokovnjaki različnih profilov lahko predajali svoje znanje in izkušnje novim generacijam.`
  },
  {
    slug: "branimir-rezic",
    name: "Branimir Rezić",
    role: "Glasbenik, pedagog, notograf, skladatelj",
    instruments: "Čembalo, klavir",
    imageKey: "brane-rezic",
    isMentor: true,
    shortBio: "Dodiplomsko izobraževanje je zaključil na Umjetničkoj akademiji u Splitu (UA Split), smer glasbena teorija. Na Akademiji za glasbo (AG LJ) je magistriral na smereh sakralna glasba in zborsko dirigiranje ter čembalo pri prof. Egonu Mihajloviću (AG LJ).",
    fullBio: `Branimir Rezić je uveljavljen skladatelj, dirigent in čembalist, rojen 1989 v Zagrebu. Svojo umetniško pot je začel že kot mlad glasbenik in se hitro uveljavil na področju zgodovinske glasbe. Njegova dela so bila večkrat nagrajena; med drugim je osvojil drugo nagrado na Samoborskem zborskem protuletju (2011, 2013) ter nagrado za najboljšo skladbo mladih skladateljev na XVII. Danih duhovne glasbe "CRO PATRIA" za delo "Oče naš". Njegove skladbe so bile večkrat izvedene na festivalih in prireditvah v Sloveniji in na Hrvaškem, prejele pa so tudi priznanja Hrvatskega sabora kulture.

Kot čembalist in asistent dirigenta je sodeloval pri pomembnih projektih baročne glasbe, vključno z izvedbami Monteverdijevih "Vesperae della beata Mariae virginis" in "Incoronazione di Poppea", ter pri festivalih, kot so Les Fêtes Musicales de Versailles. Aktivno je sodeloval z baročnim orkestrom in ansambli Akademije za glasbo v Ljubljani ter SNG Maribor.

Njegovo vodstvo in pedagoško delo zajema številne ansamble, od ženskih in moških zborov do pihalnih orkestrov, tako na Hrvaškem kot v Sloveniji. Je tudi korepetitor in umetniški svetovalec na festivalih in projektih stare glasbe, kjer združuje izvajalsko odličnost z mentoringom mlajših glasbenikov. Branimir je prepoznan kot ena vodilnih osebnosti pri ohranjanju in interpretaciji baročne in sakralne glasbe v regiji.

Poleg mentorstva in dirigiranja aktivno nastopa kot čembalist ter sodeluje pri projektih digitalizacije notnih arhivov in ohranjanja evropske glasbene dediščine.`,
  },
];

export const regularMembers = members.filter((m) => !m.isMentor);
export const mentors = members.filter((m) => m.isMentor);