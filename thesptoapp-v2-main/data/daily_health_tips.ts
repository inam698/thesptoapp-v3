/**
 * Doctor-recommended daily health tips for women's reproductive & general health.
 * Available in the 10 most spoken African languages plus English.
 *
 * Sources: WHO maternal health guidelines, ACOG patient education resources,
 * and general practitioner wellness recommendations.
 */

export interface HealthTip {
  id: number;
  emoji: string;
  translations: Record<SupportedLanguage, { title: string; body: string }>;
}

export type SupportedLanguage =
  | 'en'   // English
  | 'sw'   // Swahili
  | 'zu'   // Zulu
  | 'am'   // Amharic
  | 'ha'   // Hausa
  | 'yo'   // Yoruba
  | 'ig'   // Igbo
  | 'af'   // Afrikaans
  | 'so'   // Somali
  | 'st'   // Sesotho
  | 'xh';  // Xhosa

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  sw: 'Kiswahili',
  zu: 'isiZulu',
  am: 'አማርኛ',
  ha: 'Hausa',
  yo: 'Yorùbá',
  ig: 'Igbo',
  af: 'Afrikaans',
  so: 'Soomaali',
  st: 'Sesotho',
  xh: 'isiXhosa',
};

export const DAILY_HEALTH_TIPS: HealthTip[] = [
  {
    id: 1,
    emoji: '💧',
    translations: {
      en: {
        title: 'Stay Hydrated',
        body: 'Drinking 6-8 glasses of water daily helps regulate your menstrual cycle, reduces cramps, and supports overall reproductive health.',
      },
      sw: {
        title: 'Kunywa Maji ya Kutosha',
        body: 'Kunywa glasi 6-8 za maji kwa siku husaidia kudhibiti mzunguko wako wa hedhi, kupunguza maumivu, na kusaidia afya ya uzazi.',
      },
      zu: {
        title: 'Hlala Unamanzi Anele',
        body: 'Ukuphuza amagilasi angu-6 kuya ku-8 amanzi nsuku zonke kusiza ukulawula umjikelezo wakho wokuya esikhathini, kunciphise izinhlungu, futhi kusekele impilo yokuzala.',
      },
      am: {
        title: 'ውሃ በቂ ይጠጡ',
        body: 'በቀን ከ6-8 ብርጭቆ ውሃ መጠጣት የወር አበባ ዑደትዎን ለመቆጣጠር፣ ህመምን ለመቀነስ እና የስነ ተዋልዶ ጤናዎን ለመደገፍ ይረዳል።',
      },
      ha: {
        title: 'Sha Ruwan da Ya Isa',
        body: 'Shan gilasai 6-8 na ruwa a kowace rana yana taimakawa wajen daidaita zagayowar haila, rage ciwon ciki, da kuma tallafawa lafiyar haihuwa.',
      },
      yo: {
        title: 'Mu Omi Tó Pọ̀',
        body: 'Mimu gilasi omi 6-8 lójoojúmọ́ ń ṣe ìrànlọ́wọ́ láti ṣàkóso ìṣẹ̀lẹ̀ nkan oṣù rẹ, dín ìrora kù, àti láti ṣe àtìlẹ́yìn fún ìlera ìbímọ.',
      },
      ig: {
        title: 'Ṅụọ Mmiri Nke Ọma',
        body: 'Ịṅụ iko mmiri 6-8 kwa ụbọchị na-enyere aka ịchịkwa oge nsọ gị, belata ihe mgbu, ma kwado ahụike amụmụ.',
      },
      af: {
        title: 'Bly Gehidreer',
        body: 'Drink 6-8 glase water daagliks help om jou menstruasiesiklus te reguleer, krampe te verminder en algehele reproduktiewe gesondheid te ondersteun.',
      },
      so: {
        title: 'Biyo Ku Filan Cab',
        body: 'Cabitaanka 6-8 koob oo biyo ah maalin kasta waxay ka caawisaa in la maareeyo wareegga caadada, yareynta xanuunka, iyo taageeridda caafimaadka taranka.',
      },
      st: {
        title: 'Noa Metsi a Lekaneng',
        body: 'Ho noa digilase tse 6-8 tsa metsi ka letsatsi le leng le le leng ho thusa ho laola potoloho ea hao ea khoeli, ho fokotsa mahlaba, le ho tšehetsa bophelo bo botle ba tswalo.',
      },
      xh: {
        title: 'Hlala Unamanzi Aneleyo',
        body: 'Ukusela iiglasi zamanzi ezingu-6 ukuya kwezi-8 yonke imihla kunceda ukulawula umjikelo wakho wexesha lenyanga, kunciphise iintlungu, kwaye kuxhase impilo yokuzala.',
      },
    },
  },
  {
    id: 2,
    emoji: '🥗',
    translations: {
      en: {
        title: 'Eat Iron-Rich Foods',
        body: 'Iron from leafy greens, beans, and lean meat replaces what you lose during menstruation and helps prevent anaemia.',
      },
      sw: {
        title: 'Kula Vyakula Vyenye Madini ya Chuma',
        body: 'Chuma kutoka kwa mboga za majani, maharage, na nyama isiyo na mafuta hurejesha unachopoteza wakati wa hedhi na husaidia kuzuia upungufu wa damu.',
      },
      zu: {
        title: 'Dlani Ukudla Okunesinyithi',
        body: 'Insimbi evela emifushweni eluhlaza, ubhontshisi, kanye nenyama engenayo amafutha ibuyisela okukhohlwa ngesikhathi sokuya esikhathini futhi isiza ukuvimbela i-anaemia.',
      },
      am: {
        title: 'ብረት ያበዛ ምግቦችን ይመገቡ',
        body: 'ከቅጠላ ቅጠሎች፣ ባቄላ እና ቀጭን ስጋ የሚገኝ ብረት በወር አበባ ወቅት የሚጠፋውን ይተካል እና የደም ማነስን ለመከላከል ያግዛል።',
      },
      ha: {
        title: 'Ci Abincin da ke Dauke da Ƙarfe',
        body: 'Ƙarfe daga ganyen kore, wake, da naman da bashi da kitse yana maye gurbin abin da kike rasa lokacin haila kuma yana taimakawa wajen hana karancin jini.',
      },
      yo: {
        title: 'Jẹ Oúnjẹ Tó Ní Iron',
        body: 'Iron láti inú ewé alawọ̀ ewé, ẹ̀wà, àti ẹran tí kò ní ọ̀rá ń rọ́pò ohun tí o pàdánù nígbà nkan oṣù rẹ ó sì ń ṣe ìdíwọ́ fún àìsàn ẹ̀jẹ̀.',
      },
      ig: {
        title: 'Rie Nri Nwere Iron',
        body: 'Iron sitere na akwụkwọ nri ndụ, agwa, na anụ na-adịghị abụba na-anọchi ihe i tufuru n\'oge nsọ gị ma na-enyere aka igbochi ọrịa ọbara.',
      },
      af: {
        title: 'Eet Ysterryk Voedsel',
        body: 'Yster van blaargroente, boontjies en maer vleis vervang wat jy tydens menstruasie verloor en help om anemie te voorkom.',
      },
      so: {
        title: 'Cun Cuntada Birta Leh',
        body: 'Birta ka timaada caleemaha cagaaran, digirta, iyo hilibka cayriisku wuxuu bedelaa waxaad lumiso xilliga caadada wuxuuna ka caawiyaa ka hortagga dhiigga yaraan.',
      },
      st: {
        title: 'Ja Lijo Tse Nang le Tshepe',
        body: 'Tshepe e tsoang meroho e tala, linaoa, le nama e senang mafura e nkela sebaka sa seo o se lahlehelang nakong ea khoeli mme e thusa ho thibela ho hloka mali.',
      },
      xh: {
        title: 'Tya Ukutya Okunesinyithi',
        body: 'Isinyithi esivela kumrhwabu oluhlaza, iimbotyi, kunye nenyama enqabileyo sibuyisela oko ulahlekelwa kuko ngexesha lenyanga kwaye sinceda ukuthintela i-anaemia.',
      },
    },
  },
  {
    id: 3,
    emoji: '🏃‍♀️',
    translations: {
      en: {
        title: 'Move Your Body Daily',
        body: '30 minutes of moderate activity — walking, dancing, or yoga — can ease period pain, reduce stress, and boost your mood naturally.',
      },
      sw: {
        title: 'Fanya Mazoezi Kila Siku',
        body: 'Dakika 30 za mazoezi ya wastani — kutembea, kucheza, au yoga — zinaweza kupunguza maumivu ya hedhi, kupunguza msongo, na kuboresha hali yako kwa asili.',
      },
      zu: {
        title: 'Yenza Umzimba Wakho Unyakaze',
        body: 'Imizuzu engu-30 yokuvocavoca okungaphakathi — ukuhamba, ukudansa, noma i-yoga — kunganciphisa ubuhlungu besikhathi, kunciphise ukucindezeleka, futhi kukhulise umoya wakho.',
      },
      am: {
        title: 'በየቀኑ አካልዎን ያንቀሳቅሱ',
        body: '30 ደቂቃ መካከለኛ እንቅስቃሴ — መራመድ፣ መደነስ ወይም ዮጋ — የወር አበባ ህመምን ሊያቃልል፣ ጭንቀትን ሊቀንስ እና ስሜትዎን በተፈጥሮ ሊያሻሽል ይችላል።',
      },
      ha: {
        title: 'Motsa Jiki Kowace Rana',
        body: 'Minti 30 na motsa jiki mai sauƙi — tafiya, rawa, ko yoga — na iya rage ciwon haila, rage damuwa, da kuma inganta yanayin ku ta halitta.',
      },
      yo: {
        title: 'Ṣe Eré Ìdárayá Lójoojúmọ́',
        body: 'Ìṣẹ́jú 30 ti ìṣe eré ìdárayá — rìn, jó, tàbí yoga — lè dín ìrora oṣù kù, dín àníyàn kù, àti mú kí inú rẹ dùn ní ọ̀nà àdánidá.',
      },
      ig: {
        title: 'Mee Ahụ Ka Ọ Kwaga',
        body: 'Nkeji 30 nke ọrụ ahụ dị nwayọọ — ịga ije, ite egwu, ma ọ bụ yoga — nwere ike belata ihe mgbu oge nsọ, belata nchekasị, ma kwalite ọnọdụ gị.',
      },
      af: {
        title: 'Beweeg Jou Liggaam Daagliks',
        body: '30 minute se matige aktiwiteit — stap, dans of joga — kan menstruasiepyn verlig, stres verminder en jou bui op \'n natuurlike manier verbeter.',
      },
      so: {
        title: 'Dhaqdhaqaaqi Maalin Kasta',
        body: '30 daqiiqo oo dhaqdhaqaaq dhexdhexaad ah — socodka, cayaaraha, ama yoga — waxay yarayn kartaa xanuunka caadada, walwalka, oo dareenkaaga si dabiici ah u wanaagsaa.',
      },
      st: {
        title: 'Sisinyeha Ka Letsatsi',
        body: 'Metsotso e 30 ea boikhathollo bo bohareng — ho tsamaea, ho tantsha, kapa yoga — bo ka fokotsa bohloko ba khoeli, fokotsa khatello ea maikutlo, le ho matlafatsa maikutlo a hao.',
      },
      xh: {
        title: 'Shukumisa Umzimba Wakho Yonke Imihla',
        body: 'Imizuzu engama-30 yokuzilolonga okungaphakathi — ukuhamba, ukudanisa, okanye iyoga — kunokunciphisa iintlungu zexesha lenyanga, kunciphise uxinzelelo, kwaye kukhulise umoya wakho.',
      },
    },
  },
  {
    id: 4,
    emoji: '😴',
    translations: {
      en: {
        title: 'Prioritise Quality Sleep',
        body: 'Aim for 7-9 hours of sleep each night. Poor sleep disrupts hormone balance, worsens PMS symptoms, and weakens your immune system.',
      },
      sw: {
        title: 'Weka Kipaumbele Usingizi Bora',
        body: 'Lenga saa 7-9 za usingizi kila usiku. Usingizi mbaya unavuruga usawa wa homoni, unazidisha dalili za PMS, na kudhoofisha mfumo wako wa kinga.',
      },
      zu: {
        title: 'Qala Ngokubaluleka Kokulala Kahle',
        body: 'Zama amahora angu-7 kuya ku-9 okulala ubusuku ngabunye. Ukulala okubi kuphazamisa ukubalanswa kwamahomoni, kubangele izimpawu ze-PMS zibe zimbi, futhi kubuthakathise uhlelo lwakho lwemvelo.',
      },
      am: {
        title: 'ጥራት ያለው እንቅልፍ ቅድሚያ ይስጡ',
        body: 'በእያንዳንዱ ምሽት ከ7-9 ሰዓታት እንቅልፍ ለማግኘት ይሞክሩ። ደካማ እንቅልፍ የሆርሞን ሚዛንን ያዛባል፣ የPMS ምልክቶችን ያባብሳል እና በሽታ የመከላከል ስርዓትዎን ያዳክማል።',
      },
      ha: {
        title: 'Ka Barci Mai Inganci Ya Fi Muhimmanci',
        body: 'Yi ƙoƙarin kwana awanni 7-9 a kowace dare. Barci mara kyau yana dagula daidaiton hormone, yana tsananta alamomin PMS, kuma yana raunana tsarin rigakafin jikin ku.',
      },
      yo: {
        title: 'Fi Orun Dídára Ṣe Pàtàkì',
        body: 'Gbìyànjú láti sùn fún wákàtí 7-9 ní alẹ́ kọ̀ọ̀kan. Orun tí kò dára ń ba ìwọ́ntúnwọ́nsì homonu jẹ́, ó ń mú àmì PMS burú sí i, ó sì ń mú kí ètò àjesára rẹ rẹ̀.',
      },
      ig: {
        title: 'Mee Ụra Ezigbo Ihe Mbụ',
        body: 'Gbalịa ihi ụra awa 7-9 n\'abalị ọ bụla. Ụra ọjọọ na-emebi nha nha hormone, na-eme ka ihe mgbaàmà PMS ka njọ, ma na-eme ka usoro ahụike gị daa mba.',
      },
      af: {
        title: 'Prioritiseer Goeie Slaap',
        body: 'Mik vir 7-9 uur slaap elke nag. Swak slaap versteur hormoonbalans, vererger PMS-simptome en verswak jou immuunstelsel.',
      },
      so: {
        title: 'Hurdo Tayada Leh Ha Aad u Muhiim',
        body: 'U ilaali 7-9 saacadood oo hurdo ah habeen kasta. Hurdada xumaantu waxay khalkhal gelisaa hormoonka, sii daraa calaamadaha PMS, waxayna tabar yaraynaysaa difaaca jirkaaga.',
      },
      st: {
        title: 'Etsa Boroko bo Boleng Ntlha ea Pele',
        body: 'Leka ho robala lihora tse 7-9 bosiu bo bong le bo bong. Boroko bo bobe bo senyetsa tekatekano ea li-hormone, bo etsa matšoao a PMS a be mabe, le ho fokotsa matla a tšireletso ea \'mele.',
      },
      xh: {
        title: 'Yenza Ubuthongo Obusemgangathweni Kuqala',
        body: 'Zama iiyure ezisixhenxe ukuya kwezithoba zobuthongo rhoqo ngobusuku. Ubuthongo obubi buphazamisa ibhalansi yehomoni, benza iimpawu ze-PMS zibe mbi, kwaye buthobisa inkqubo yakho yokuzikhusela.',
      },
    },
  },
  {
    id: 5,
    emoji: '🧼',
    translations: {
      en: {
        title: 'Practice Good Hygiene',
        body: 'Change pads or tampons every 4-6 hours and wash with plain water. Avoid douching — it disrupts your natural vaginal flora.',
      },
      sw: {
        title: 'Fanya Usafi Mzuri',
        body: 'Badilisha pedi au tamponi kila masaa 4-6 na osha kwa maji safi. Epuka douching — inavuruga flora ya asili ya uke.',
      },
      zu: {
        title: 'Yenza Inhlanzeko Enhle',
        body: 'Shintsha amapedi noma ama-tampon njalo emva kwamahora angu-4 kuya ku-6 futhi ugeze ngamanzi angenalutho. Gwema ukugeza ngaphakathi — kuphazamisa iflora yakho yemvelo.',
      },
      am: {
        title: 'ጥሩ ንጽህና ይጠብቁ',
        body: 'ፓድ ወይም ታምፖን በየ4-6 ሰዓቱ ይቀይሩ እና በንጹህ ውሃ ይታጠቡ። ዳውቺንግን ያስወግዱ — የተፈጥሮ የብልት ፍሎራዎን ያዛባል።',
      },
      ha: {
        title: 'Yi Tsaftar Jiki Mai Kyau',
        body: 'Canja pad ko tampon kowane awanni 4-6 kuma a wanke da ruwan da babu komai. Ka guji douching — yana dagula tsarin halitta na al\'aura.',
      },
      yo: {
        title: 'Ṣe Ìmọ́tótó Dáradára',
        body: 'Yí padì tàbí tampon padà ní gbogbo wákàtí 4-6 kí o sì wẹ̀ pẹ̀lú omi lásán. Yẹra fún ìfọwẹ̀ inú — ó ń ba àwọn kòkòrò ara rẹ tí ó dára jẹ́.',
      },
      ig: {
        title: 'Mee Ịdị Ọcha Nke Ọma',
        body: 'Gbanwee pad ma ọ bụ tampon kwa awa 4-6 wee sacha ahụ gị na mmiri ọcha. Zere ịsa ahụ n\'ime — ọ na-emebi flora ọdịda ebi gị.',
      },
      af: {
        title: 'Beoefen Goeie Higiëne',
        body: 'Verander doekies of tampons elke 4-6 uur en was met gewone water. Vermy uitspoel — dit versteur jou natuurlike vaginale flora.',
      },
      so: {
        title: 'Ku Dhaqan Nadaafad Wanaagsan',
        body: 'Beddel paadka ama tamponka 4-6 saacadood kasta oo ku dhaq biyo caadi ah. Ka fogow xaaqidda — waxay khalkhal gelisaa bakteeriyada dabiiciga ah ee siilka.',
      },
      st: {
        title: 'Etsa Bohloeki bo Botle',
        body: 'Fetola lipadi kapa li-tampon ka hora tse 4-6 mme o hlatsoe ka metsi a hloekileng. Phema ho hlatsoa ka hare — ho senya limela tsa tlhaho tsa setho sa bosadi.',
      },
      xh: {
        title: 'Gcina Ucoceko Olulungileyo',
        body: 'Tshintsha iipadi okanye iitampon rhoqo emva kweeyure ezi-4 ukuya kwezi-6 kwaye uhlambe ngamanzi nje. Phepha ukuhlamba ngaphakathi — kuphazamisa iflora yakho yemvelo.',
      },
    },
  },
  {
    id: 6,
    emoji: '🩺',
    translations: {
      en: {
        title: 'Schedule Regular Check-ups',
        body: 'Visit your healthcare provider at least once a year for a pelvic exam and screening. Early detection saves lives.',
      },
      sw: {
        title: 'Panga Uchunguzi wa Mara kwa Mara',
        body: 'Tembelea mtoa huduma wako wa afya angalau mara moja kwa mwaka kwa uchunguzi wa nyonga na upimaji. Ugunduzi wa mapema huokoa maisha.',
      },
      zu: {
        title: 'Hlela Ukuhlolwa Njalo',
        body: 'Vakashela umhlinzeki wakho wezempilo okungenani kanye ngonyaka ukuze uhlolwe ngasesithweni kanye nokuhlolwa. Ukutholwa ngokushesha kusindisa impilo.',
      },
      am: {
        title: 'መደበኛ ምርመራዎችን ያቅዱ',
        body: 'ቢያንስ በዓመት አንድ ጊዜ ለጎን ምርመራ እና ለምርመራ የጤና አገልግሎት ሰጪዎን ይጎብኙ። ቀድሞ ማወቅ ህይወትን ያድናል።',
      },
      ha: {
        title: 'Shirya Duba Lafiya Akai-akai',
        body: 'Ziyarci mai ba ka magani aƙalla sau ɗaya a shekara don gwajin ƙwanƙwasa da tantancewa. Ganowa da wuri yana ceton rai.',
      },
      yo: {
        title: 'Ṣètò Àyẹ̀wò Déédéé',
        body: 'Ṣabẹ̀wò sí olùpèsè ìtọ́jú ìlera rẹ ní ó kéré jù lẹ́ẹ̀kan lọ́dún fún àyẹ̀wò ìbàdí àti ìṣàyẹ̀wò. Ìwádìí ní ìbẹ̀rẹ̀ ń gbà ẹ̀mí là.',
      },
      ig: {
        title: "Hazzie Nlele Ahụike Mgbe Niile",
        body: 'Gaa lee onye na-ahụ maka ahụike gị otu ugboro n\'afọ maka nlele ukwu na nyocha. Ịchọpụta oge na-azọpụta ndụ.',
      },
      af: {
        title: 'Beplan Gereelde Ondersoeke',
        body: 'Besoek jou gesondheidsorgverskaffer minstens een keer per jaar vir \'n pelviese ondersoek en sifting. Vroeë opsporing red lewens.',
      },
      so: {
        title: 'Qorshee Baaritaanno Joogto Ah',
        body: 'Booqo bixiyaha daryeelka caafimaadkaaga ugu yaraan hal mar sannadkii si loo baaro xasanka iyo shaandhaynta. Ogaanshaha hore wuxuu badbaadiyaa nolosha.',
      },
      st: {
        title: 'Rala Litlhahlobo Tsa Kamehla',
        body: 'Etela motho ea o fanang ka tlhokomelo ea bophelo bo botle bonyane hang ka selemo bakeng sa tlhahlobo ea hip le tlhahlobo. Ho fumana ka pela ho pholosa maphelo.',
      },
      xh: {
        title: 'Ceba Ukuhlolwa Rhoqo',
        body: 'Ndwendwela umniki-nkonzo wakho wezempilo ubuncinane kanye ngonyaka ukuze uhlolwe isiqu kunye nokukhangela. Ukufunyanwa kwangethuba kusindisa ubomi.',
      },
    },
  },
  {
    id: 7,
    emoji: '🧘‍♀️',
    translations: {
      en: {
        title: 'Manage Your Stress',
        body: 'Chronic stress raises cortisol and can delay or stop your period. Try deep breathing, journaling, or talking to someone you trust.',
      },
      sw: {
        title: 'Dhibiti Msongo wa Mawazo',
        body: 'Msongo wa muda mrefu huongeza cortisol na unaweza kuchelewesha au kusimamisha hedhi yako. Jaribu kupumua kwa kina, kuandika jarida, au kuzungumza na mtu unayemwamini.',
      },
      zu: {
        title: 'Phatha Ukucindezeleka Kwakho',
        body: 'Ukucindezeleka okungapheli kuphakamisa i-cortisol futhi kungalibazisa noma kumise isikhathi sakho. Zama ukuphefumula ngokujulile, ukubhala ijenali, noma ukukhuluma nomuntu omethembayo.',
      },
      am: {
        title: 'ጭንቀትዎን ይቆጣጠሩ',
        body: 'ሥር የሰደደ ጭንቀት ኮርቲዞልን ከፍ ያደርጋል እና የወር አበባዎን ሊያዘገይ ወይም ሊያቆም ይችላል። ጥልቅ መተንፈስ ይሞክሩ፣ ማስታወሻ ይጻፉ ወይም ከሚያምኑት ሰው ጋር ያውሩ።',
      },
      ha: {
        title: 'Magance Damuwar Ka',
        body: 'Damuwa ta ci gaba tana haɓaka cortisol kuma tana iya jinkirta ko dakatar da hailarka. Gwada numfashi mai zurfi, rubutu, ko magana da wanda kake amincewa da shi.',
      },
      yo: {
        title: "Ṣàkóso Àníyàn Rẹ",
        body: "Àníyàn tí kò parí ń gbé cortisol sókè ó sì lè dá oṣù rẹ dúró tàbí dádúró. Gbìyànjú mímí jíjinlẹ̀, kíkọ ìwé àkọsílẹ̀, tàbí bá ẹni tí o gbẹ́kẹ̀lé sọ̀rọ̀.",
      },
      ig: {
        title: 'Jikwaa Nchekasị Gị',
        body: 'Nchekasị na-adịgide na-ebuli cortisol elu ma nwee ike igbochi ma ọ bụ ịkwụsị oge nsọ gị. Nwalee iku ume nke omimi, ide akwụkwọ, ma ọ bụ gwa onye ị tụkwasịrị obi okwu.',
      },
      af: {
        title: 'Bestuur Jou Stres',
        body: 'Chroniese stres verhoog kortisol en kan jou menstruasie vertraag of stop. Probeer diep asemhaling, joernaalskrywing of praat met iemand wat jy vertrou.',
      },
      so: {
        title: 'Maaree Walwalkaaga',
        body: 'Walwalka joogtada ah wuxuu kordhaynayaa cortisol-ka wuxuuna dib u dhigi karaa ama joojin karaa caadadaada. Isku day neefsashada qota dheer, qorista, ama la hadal qof aad ku kalsoon tahay.',
      },
      st: {
        title: "Laola Khatello ea Maikutlo",
        body: "Khatello ea maikutlo e sa feleng e phahamisa cortisol 'me e ka lieha kapa ho emisa khoeli ea hao. Leka ho hema ka botebo, ho ngola jenale, kapa ho bua le motho eo o mo tšepang.",
      },
      xh: {
        title: 'Lawula Uxinzelelo Lwakho',
        body: 'Uxinzelelo olungapheliyo luphakamisa i-cortisol kwaye lunokubangela ukubambezeleka okanye ukumiswa kwexesha lakho lenyanga. Zama ukuphefumla nzulu, ukubhala ijenali, okanye ukuthetha nomntu omthembayo.',
      },
    },
  },
  {
    id: 8,
    emoji: '🌡️',
    translations: {
      en: {
        title: 'Track Your Cycle',
        body: 'Knowing your cycle length helps you predict ovulation, spot irregularities early, and share useful data with your doctor.',
      },
      sw: {
        title: 'Fuatilia Mzunguko Wako',
        body: 'Kujua urefu wa mzunguko wako kunakusaidia kutabiri ovulation, kugundua mabadiliko mapema, na kushiriki data muhimu na daktari wako.',
      },
      zu: {
        title: 'Landela Umjikelezo Wakho',
        body: 'Ukwazi ubude bomjikelezo wakho kukusiza ukuqagela i-ovulation, ukubona izinkinga ngokushesha, kanye nokwabelana ngedatha ewusizo nodokotela wakho.',
      },
      am: {
        title: 'ዑደትዎን ይከታተሉ',
        body: 'የዑደትዎን ርዝመት ማወቅ ኦቭሌሽንን ለመተንበይ፣ ያልተለመዱ ነገሮችን ቀደም ብሎ ለማግኘት እና ጠቃሚ መረጃን ከዶክተርዎ ጋር ለማጋራት ይረዳዎታል።',
      },
      ha: {
        title: 'Bi na Bayani Game da Zagayowar Ki',
        body: 'Sanin tsawon zagayowar ki yana taimaka ki yi hasashen ovulation, gano matsaloli da wuri, da raba bayanai masu amfani da likitanki.',
      },
      yo: {
        title: 'Tọpasẹ́ Àyíká Oṣù Rẹ',
        body: 'Mímọ̀ gígùn àyíká rẹ ń ràn ọ́ lọ́wọ́ láti sọtẹ́lẹ̀ ovulation, ṣàkíyèsí àwọn àìṣeéṣe ní ìbẹ̀rẹ̀, àti pín dátà tó wúlò pẹ̀lú dókítà rẹ.',
      },
      ig: {
        title: 'Soro Mgbanwe Gị',
        body: 'Ịmara ogologo oge gị na-enyere gị aka ịkọ ihe banyere ovulation, ịchọpụta nsogbu n\'oge, yana ịkekọrịta data bara uru na dọkịta gị.',
      },
      af: {
        title: 'Volg Jou Siklus',
        body: 'Om jou sikluslengte te ken help jou om ovulasie te voorspel, onreëlmatighede vroeg op te merk en nuttige data met jou dokter te deel.',
      },
      so: {
        title: 'Raadi Wareegga Caadadaada',
        body: 'Ogaanshaha dhererka wareegga caadadaada wuxuu kaa caawiyaa saadaalintu in la saadaaliyo, in si hore loo ogaado khaladaadka, iyo in la wadaago xogta faa\'iidada leh dhakhtarkaaga.',
      },
      st: {
        title: "Latela Potoloho ea Hao",
        body: "Ho tseba bolelele ba potoloho ea hao ho o thusa ho bolela esale pele ka ovulation, ho bona mathata ka pela, le ho arolelana lintlha tse molemo le ngaka ea hao.",
      },
      xh: {
        title: 'Landela Umjikelo Wakho',
        body: 'Ukwazi ubude bomjikelo wakho kukunceda ukuqikelela i-ovulation, ukubona iingxaki kwangethuba, kunye nokwabelana ngedatha eluncedo nogqirha wakho.',
      },
    },
  },
  {
    id: 9,
    emoji: '🛡️',
    translations: {
      en: {
        title: 'Protect Against STIs',
        body: 'Use condoms consistently and get tested regularly. Many STIs have no symptoms but can lead to infertility if untreated.',
      },
      sw: {
        title: 'Jilinde Dhidi ya Magonjwa ya Zinaa',
        body: 'Tumia kondomu kwa uthabiti na upimwe mara kwa mara. Magonjwa mengi ya zinaa hayana dalili lakini yanaweza kusababisha utasa iwapo hayatibiwe.',
      },
      zu: {
        title: 'Zivikele Ezifo Ezidluliselwa Ngocansi',
        body: 'Sebenzisa amakhondomu njalo futhi uhlolwe njalo. Izifo eziningi ezidluliselwa ngocansi azinazimpawu kodwa zingaholela ekungabikho kwezingane uma zingelashiwe.',
      },
      am: {
        title: 'ከSTI መከላከል',
        body: 'ኮንዶም በተከታታይ ይጠቀሙ እና በመደበኛነት ምርመራ ያድርጉ። ብዙ STIs ምልክቶች የሉም ነገር ግን ካልታከሙ መሃንነትን ሊያስከትሉ ይችላሉ።',
      },
      ha: {
        title: 'Kare Kanka Daga STI',
        body: 'Yi amfani da kwaroron roba kullum kuma a yi gwajin kai akai-akai. STI da yawa ba su da alamomi amma suna iya haifar da rashin haihuwa idan ba a yi musu magani ba.',
      },
      yo: {
        title: 'Dáàbò Bo Ara Rẹ Lọ́wọ́ STI',
        body: 'Lo kọ́ndọ́mù ní ìgbà gbogbo kí o sì ṣe àyẹ̀wò dédé. STI púpọ̀ kò ní àmì àrùn ṣùgbọ́n ó lè yọrí sí àìlóbí tí a kò bá gbà ìtọ́jú.',
      },
      ig: {
        title: 'Chekwaa Onwe Gị na STI',
        body: 'Jiri kọndọm mgbe niile ma gaa anwale mgbe niile. Ọtụtụ STI enweghị ihe mgbaàmà mana ha nwere ike ibata enweghị ime ma ọ bụrụ na a ghọghị ha.',
      },
      af: {
        title: 'Beskerm Teen SOI\'s',
        body: 'Gebruik kondome konsekwent en laat jouself gereeld toets. Baie SOI\'s het geen simptome nie, maar kan tot onvrugbaarheid lei as dit onbehandeld bly.',
      },
      so: {
        title: "Ka Ilaali STI-yada",
        body: "Isticmaal koondamka si joogto ah oo si joogto ah baaritaan iska samee. STI-yo badan ma lahan calaamado laakiin waxay keeni karaan madhalays haddii aan la daaweyn.",
      },
      st: {
        title: 'Itšireletse Khahlano le STI',
        body: 'Sebelisa likhohlopo ka ho tsepama mme o hlahlojoe kamehla. STI tse ngata ha li na matšoao empa li ka lebisa ho hloka bana haeba li sa alafoe.',
      },
      xh: {
        title: 'Zikhusele Kwi-STI',
        body: 'Sebenzisa iikhondom rhoqo kwaye uhlolwe rhoqo. Ezininzi ii-STI azinazimpawu kodwa zinokukhokelela ekungazalikeni ukuba azinyangwa.',
      },
    },
  },
  {
    id: 10,
    emoji: '🧠',
    translations: {
      en: {
        title: 'Look After Your Mental Health',
        body: 'Hormonal changes can affect mood. If you feel persistently sad or anxious, reach out to a counsellor — seeking help is a sign of strength.',
      },
      sw: {
        title: 'Tunza Afya Yako ya Akili',
        body: 'Mabadiliko ya homoni yanaweza kuathiri hali yako. Ikiwa unahisi huzuni au wasiwasi kwa muda mrefu, wasiliana na mshauri — kutafuta msaada ni ishara ya nguvu.',
      },
      zu: {
        title: 'Nakekela Impilo Yakho Yengqondo',
        body: 'Izinguquko zamahomoni zingathinta indlela ozizwa ngayo. Uma uzizwa udangele noma ukhathazekile njalo, xhumana nomeluleki — ukufuna usizo kuwuphawu lwamandla.',
      },
      am: {
        title: 'የአዕምሮ ጤናዎን ይከታተሉ',
        body: 'የሆርሞን ለውጦች ስሜትን ሊጎዱ ይችላሉ። ያለማቋረጥ ሀዘን ወይም ጭንቀት ከተሰማዎት አማካሪን ያነጋግሩ — እርዳታ መጠየቅ የጥንካሬ ምልክት ነው።',
      },
      ha: {
        title: "Kula da Lafiyar Hankalin Ka",
        body: "Canje-canjen hormone na iya shafar yanayin ku. Idan kuna jin baƙin ciki ko damuwa ba tare da ƙarewa ba, tuntuɓi mai ba da shawara — neman taimako alama ce ta ƙarfi.",
      },
      yo: {
        title: 'Tọ́jú Ìlera Ọpọlọ Rẹ',
        body: 'Àwọn ìyípadà homonu lè kan inú rẹ. Tí o bá ń ní ìbànújẹ́ tàbí àníyàn tí kò parí, kàn sí olùdámọ̀ràn — wíwá ìrànlọ́wọ́ jẹ́ àmì agbára.',
      },
      ig: {
        title: 'Lekwasị Ahụike Uche Gị Anya',
        body: 'Mgbanwe hormone nwere ike imetụta mmetụta uche gị. Ọ bụrụ na ị nọgide na-enwe mwute ma ọ bụ nchekasị, kpọtụrụ onye ndụmọdụ — ịchọ enyemaka bụ ihe ngosi nke ike.',
      },
      af: {
        title: 'Kyk na Jou Geestesgesondheid',
        body: 'Hormonale veranderinge kan jou gemoed beïnvloed. As jy aanhoudend hartseer of angstig voel, reik uit na \'n berader — om hulp te soek is \'n teken van krag.',
      },
      so: {
        title: 'U Fiiri Caafimaadka Maskaxda',
        body: 'Isbedelka hormoonku wuxuu saameyn karaa dareenka. Haddii aad si joogto ah dareento murugo ama walwal, la xiriir la-taliye — raadsiga caawimaad waa calaamad xoog.',
      },
      st: {
        title: "Hlokomela Bophelo ba Kelello ea Hao",
        body: "Liphetoho tsa li-hormone li ka ama maikutlo a hao. Haeba o ikutloa o le molumo kapa o tšoenyehile nako e telele, ikopanye le moeletsi — ho batla thuso ke ponts'o ea matla.",
      },
      xh: {
        title: 'Jonga Impilo Yakho Yengqondo',
        body: 'Utshintsho lwehomoni lunokuchaphazela indlela ovakalelwa ngayo. Ukuba uziva ulusizi okanye unexhala rhoqo, thetha nomcebisi — ukufuna uncedo luphawu lwamandla.',
      },
    },
  },
];
