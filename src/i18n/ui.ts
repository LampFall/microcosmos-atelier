// Alle teksten van de site per taal (nl en en, met dezelfde sleutels).
// Dagboekteksten staan in src/content/journal/, niet hier.

export const defaultLang = 'nl';

export const ui = {
  nl: {
    'nav.ourWork':
      'Projecten',
    'nav.about': 'Over mij',
    'nav.contact': 'Contact',
    'nav.journal': 'Dagboek',
    'nav.faq': 'FAQ',
    'nav.menu': 'Menu',
    'nav.backToTop': 'Naar boven',
    'nav.skipToContent': 'Naar de inhoud',
    'analytics.off': 'Dit toestel wordt niet meer meegeteld in de statistieken.',
    'analytics.on': 'Dit toestel wordt weer meegeteld in de statistieken.',
    'analytics.noStorage': 'Deze keuze kan in deze browser niet onthouden worden (privévenster?).',

    'footer.copyright': 'Microcosmos Atelier',
    'footer.privacy': 'Privacy',
    'faq.meta.title': 'Veelgestelde vragen — Microcosmos Atelier',
    'faq.meta.description': 'Antwoorden op vragen over prijs, verloop, duur, regio, onderhoud en meer bij een Microcosmos op maat.',
    'faq.eyebrow': 'Veelgestelde vragen',
    'faq.title': 'Goed om te weten.',
    'faq.lead': 'Enkele vragen die ik vaak krijg. Staat je vraag er niet tussen? Stel ze gerust.',
    'faq.closing.title': 'Nog een vraag?',
    'faq.closing.text': 'Elke ruimte en elk idee is anders. Vertel me wat je in gedachten hebt, dan bekijken we het samen.',
    'faq.closing.button': 'Start een gesprek',
    'faq.link': 'Veelgestelde vragen',
    'notFound.meta.title': 'Pagina niet gevonden — Microcosmos Atelier',
    'notFound.meta.description': 'Deze pagina bestaat niet (meer).',
    'notFound.eyebrow': 'Pagina niet gevonden',
    'notFound.title': 'Deze pagina bestaat niet (meer).',
    'notFound.text': 'Misschien is ze verplaatst, of zit er een tikfout in het adres. Hier kun je verder:',
    'notFound.home': 'Naar de home',
    'notFound.english': 'This page doesn’t exist (anymore).',
    'notFound.englishLink': 'Go to the English home page',
    'footer.faq': 'FAQ',
    'faq.q1': 'Wat kost een Microcosmos?',
    'faq.a1':
      'Elke Microcosmos is uniek, dus er is geen vaste prijs. De prijs hangt vooral af van de grootte van het aquarium, het meubel en de techniek (filter, licht, verwarming en eventueel CO₂), het hout en de stenen, de planten en dieren, en of je het onderhoud zelf doet of aan mij overlaat. Na een eerste gesprek maak ik een voorstel op maat.',
    'faq.q2': 'Hoe verloopt een project?',
    'faq.a2':
      'Het begint met een gesprek en een bezoek aan je ruimte. Daarna maak ik een ontwerp met een eerste voorstel, en vervolgens een gedetailleerd voorstel. Dan volgen de bouw, de installatie en de oplevering. Wil je dat ik het daarna blijf verzorgen, dan kan dat ook.',
    'faq.q3': 'Hoe lang duurt het?',
    'faq.a3':
      'Als er aan je interieur niets moet veranderen, reken je op ongeveer 6 tot 10 weken; dat hangt vooral af van de levering van het aquarium. Daarna groeit het ecosysteem rustig verder: over een periode van 2 tot 3 maanden komen de vissen erbij.',
    'faq.q4': 'In welke regio werk je?',
    'faq.a4':
      'Vooral in de provincies Antwerpen, Oost-Vlaanderen en Vlaams-Brabant. Woon je verder weg? Laat het me weten, dan bekijken we samen wat mogelijk is.',
    'faq.q5': 'Is het eerste gesprek vrijblijvend?',
    'faq.a5':
      'Ja. Het eerste gesprek is gratis en helemaal vrijblijvend.',
    'faq.q6': 'Hoeveel onderhoud vraagt het, en kun jij dat doen?',
    'faq.a6':
      'Je kunt al het onderhoud aan mij overlaten met een maandelijks servicecontract; zelf geef je dan enkel de vissen te eten. Doe je het liever zelf, dan kun je me inroepen wanneer je hulp nodig hebt, en werk ik in regie.',
    'faq.q7': 'Wat als ik op vakantie ga?',
    'faq.a7':
      'Ben je langer dan een week weg, dan kan ik een voederautomaat installeren. Het onderhoud kunnen we uitstellen of gewoon laten doorlopen; dat hangt af van de situatie en van het ecosysteem. Een pas opgestart aquarium vraagt meer zorg dan een ecosysteem dat al jaren draait.',
    'faq.q8': 'Kun je mijn bestaande aquarium opnieuw inrichten?',
    'faq.a8':
      'Ja, een bestaand aquarium kan ik opnieuw inrichten. Omdat elk aquarium anders is, bekijk ik dat geval per geval.',
    'faq.q9': 'Kan het met kinderen of huisdieren in huis?',
    'faq.a9':
      'Zeker. Zolang er niets in het aquarium belandt en andere dieren er niet bij kunnen, is een Microcosmos een mooie aanvulling voor het hele huis.',
    'faq.q10': 'Hoeveel stroom verbruikt het?',
    'faq.a10':
      'Dat hangt vooral af van de temperatuur in je ruimte, de watertemperatuur die de bewoners nodig hebben en het volume water dat verwarmd moet worden. Verlichting en pomp verbruiken tegenwoordig vrij weinig.',
    'faq.q11': 'Kan het ook zonder vissen, of als paludarium?',
    'faq.a11':
      'Zeker, dat is bespreekbaar: een aquarium met alleen planten, of een paludarium met water en land, kan evengoed een levend ecosysteem worden.',
    'privacy.meta.title': 'Privacy — Microcosmos Atelier',
    'privacy.meta.description': 'Welke gegevens Microcosmos Atelier verzamelt, waarom en hoe lang.',
    'privacy.eyebrow': 'Privacy',
    'privacy.title': 'Je gegevens, eenvoudig uitgelegd.',
    'privacy.lead': 'Deze site verzamelt zo weinig mogelijk. Hier lees je wat, waarom en hoe lang.',
    'privacy.form.title': 'Het contactformulier',
    'privacy.form.text':
      'Als je het contactformulier invult, ontvang ik je naam, je e-mailadres, waar je aan denkt, je bericht en de taal waarin je schreef. Ik gebruik die gegevens alleen om je aanvraag te beantwoorden. Het formulier wordt verwerkt en bewaard door Netlify, waar deze site gehost wordt. Aanvragen verwijder ik na ongeveer een jaar.',
    'privacy.stats.title': 'Bezoekersstatistieken',
    'privacy.stats.text':
      'Om te zien hoeveel mensen de site bezoeken en welke pagina’s ze lezen, gebruik ik Cloudflare Web Analytics. Dat meet anoniem en in totalen: welke pagina, via welke site je kwam, je land en het soort toestel. Er worden geen cookies gebruikt, je wordt niet herkend en niet gevolgd op andere sites.',
    'privacy.cookies.title': 'Cookies',
    'privacy.cookies.text': 'Deze site plaatst geen cookies.',
    'privacy.questions.title': 'Vragen',
    'privacy.questions.text':
      'Heb je een vraag over je gegevens, of wil je dat ik ze verwijder?',
    'privacy.questions.link': 'Laat het me weten via het contactformulier.',
    'contact.form.privacyLink': 'Meer over privacy',

    'about.meta.title': 'Over mij — Microcosmos Atelier',
    'about.meta.description':
      'Wie achter Microcosmos Atelier zit: Kasper Masschaele, gebeten door de microbe sinds zijn vijfde.',
    'about.image.alt': 'Kasper Masschaele',
    'about.hero.eyebrow':
      'Over mij',
    'about.hero.title':
      'Gebeten door de microbe,<br />sinds mijn vijfde.',
    'about.hero.lead':
      'Het begon met een bak goudvissen die ik won op de kermis. Sindsdien heb ik altijd aquaria gehad, en leerde ik stap voor stap hoe je er een klein ecosysteem van maakt dat zichzelf in evenwicht houdt.',
    'about.story.eyebrow': 'Het verhaal',
    'about.story.title':
      'Van goudvissenkom<br />naar ecosysteem.',
    'about.story.p1':
      'Als kind keek ik vooral naar de vissen. Later ging mijn aandacht naar wat je niet meteen ziet: de planten die het water zuiveren, de bacteriën in de bodem, de garnalen en slakken die opruimen. Pas als die allemaal samenwerken, blijft een aquarium jarenlang gezond.',
    'about.story.p2':
      'Zo werk ik vandaag nog altijd. Ik bouw een systeem dat zichzelf regelt: veel planten die goed groeien, jaar na jaar, zonder ze op te jagen met CO₂ of veel extra voeding. Soms experimenteer ik wel met een beetje CO₂. Dat geeft een ander evenwicht en sterkere groei, maar de basis moet zonder kunnen.',
    'about.story.p3':
      'De aquaria op deze site staan allemaal bij mij thuis, in mijn atelier. Sommige draaien al jaren. Ze zijn het beste bewijs dat die aanpak werkt.',
    'about.story.p4':
      'Deze zomer ben ik Microcosmos Atelier gestart, om hetzelfde voor anderen te doen: een mooi en gezond ecosysteem bij jou thuis, dat blijft.',
    'about.story.p5':
      'En je hoeft er geen expert voor te worden. Ik volg je aquarium mee op, zodat je volledig ontzorgd bent en geen leercurve hebt. Na al die jaren kan ik een aquarium lezen: ik zie snel wat er aan de hand is en wat het nodig heeft.',
    'about.story.linkedinText':
      'Meer over mij vind je op',
    'about.story.linkedinLabel':
      'LinkedIn',
    'about.story.highlight2':
      'Stabiele ecosystemen, die blijven evolueren doorheen de tijd.',
    'about.cta.eyebrow':
      'Samen beginnen',
    'about.cta.title':
      'Zin in een eigen Microcosmos?',
    'about.cta.text':
      'Vertel me waar je aan denkt. Het eerste gesprek is gratis en vrijblijvend.',
    'about.cta.button': 'Start een gesprek',

    'contact.meta.title': 'Contact — Microcosmos Atelier',
    'contact.meta.description':
      'Neem contact op met Microcosmos Atelier voor een eerste, vrijblijvend gesprek over een aquarium op maat.',
    'contact.hero.eyebrow': 'Neem contact op',
    'contact.hero.title':
      'Laten we<br />kennismaken.',
    'contact.hero.lead':
      'Vul het formulier in, dan neem ik contact met je op om een eerste gesprek af te spreken. Dat gesprek is gratis en vrijblijvend.',
    'contact.info.eyebrow': 'Een eerste gesprek',
    'contact.info.title':
      'Waar praten we over?',
    'contact.info.text':
      'Over je ruimte en waar het aquarium kan komen, wat je mooi vindt, hoe groot het mag worden, en hoeveel je zelf wilt doen of liever aan mij overlaat. Je hoeft nog niets precies te weten.',
    'contact.form.subject': 'Nieuwe aanvraag — Microcosmos Atelier',
    'contact.form.name.label': 'Naam',
    'contact.form.email.label': 'E-mail',
    'contact.form.project.label': 'Waar denk je aan?',
    'contact.form.project.placeholder': 'Selecteer een optie',
    'contact.form.project.new': 'Een nieuwe Microcosmos',
    'contact.form.project.existing': 'Een bestaand aquarium transformeren',
    'contact.form.project.maintenance': 'Onderhoud / begeleiding op lange termijn',
    'contact.form.project.tailored': 'Een project op maat',
    'contact.form.project.exploring': 'Ik verken gewoon de mogelijkheden',
    'contact.form.message.label': 'Vertel me wat meer',
    'contact.form.message.placeholder':
      'Vertel me over je ruimte, je idee of wat je graag zou willen creëren...',
    'contact.form.required': 'verplicht',
    'contact.form.privacy': 'Je gegevens gebruik ik alleen om je aanvraag te beantwoorden.',
    'contact.form.honeypot': 'Laat dit veld leeg',
    'contact.form.submit': 'Verstuur aanvraag',

    'contact.thanks.meta.title': 'Bedankt — Microcosmos Atelier',
    'contact.thanks.meta.description': 'Je aanvraag is verstuurd.',
    'contact.thanks.eyebrow': 'Aanvraag verstuurd',
    'contact.thanks.title': 'Bedankt voor je bericht.',
    'contact.thanks.text':
      'Ik lees elke aanvraag zelf en stuur je zo snel mogelijk een antwoord per e-mail.',
    'contact.thanks.back': 'Terug naar de homepage',

    'work.spec.started': 'Gestart',
    'work.spec.dimensions': 'Afmetingen',
    'work.spec.volume': 'Volume',
    'work.spec.filtration': 'Filtratie',
    'work.spec.lighting': 'Verlichting',
    'work.spec.substrate': 'Substraat',
    'work.spec.co2': 'CO₂',
    'work.spec.fish': 'Vissen',
    'work.spec.otherInhabitants': 'Andere bewoners',
    'work.spec.plants': 'Planten',

    'work.meta.title':
      'Projecten — Microcosmos Atelier',
    'work.meta.description':
      'Drie aquaria van Microcosmos Atelier in detail: opbouw, planten, bewoners en techniek.',
    'work.hero.eyebrow':
      'Projecten',
    'work.hero.title':
      'Drie aquaria,<br />bij mij thuis.',
    'work.hero.text':
      'Hoe ik werk, zie je het best aan mijn eigen bakken: veel planten, bewoners die bij elkaar passen, en een systeem dat jarenlang stabiel blijft.',

    'work.jump.label': 'Projecten op deze pagina',

    'work.project1.image.alt': 'Fallen Forest Microcosmos',
    'work.project1.eyebrow': '01 — Fallen Forest',
    'work.project1.title': 'Een bosbodem,<br />onder water gebracht.',
    'work.project1.intro':
      'Een aquarium van twee meter lang en 1.000 liter in de woonkamer, geïnspireerd op een omgevallen boom in een tropisch bos en de dichte begroeiing die eromheen ontstaat.',
    'work.project1.story.p1':
      'De opbouw volgt die omgevallen boom: open ruimtes tussen de takken, verschillende lagen begroeiing, en leven rond hout en bladeren die langzaam afbreken.',
    'work.project1.story.p2':
      "Grote groepen citroentetra's, keizertetra's en bijlzalmen brengen beweging in het open water, waarbij elke soort een andere zone van de waterkolom inneemt.",
    'work.project1.story.p3':
      "De tetra's bewegen door de centrale ruimtes tussen de takken en vegetatie, terwijl de bijlzalmen dicht bij het wateroppervlak blijven. Corydoras verkennen voortdurend de onderste lagen en zoeken tussen bladeren en substraat naar voedsel.",
    'work.project1.story.p4':
      'Boven het water groeien Monstera en Pothos uit het aquarium en nemen ze rechtstreeks voedingsstoffen uit het water op. Garnalen, slakken en micro-organismen bewonen de minder zichtbare lagen van het ecosysteem, waar ze organisch materiaal verwerken en bijdragen aan de nutriëntenkringloop.',
    'work.project1.story.p5':
      'De bak draait sinds 2023. Planten groeien, populaties veranderen, en het geheel wordt elk jaar rijper.',
    'work.project1.ecosystemEyebrow': 'Het ecosysteem',
    'work.project1.principle.p1':
      'Veel planten, onder en boven water, nemen de voedingsstoffen op die de vissen en de afbraak van bladeren en hout opleveren. Zo blijft het water stabiel.',
    'work.project1.principle.p2':
      'Elke laag heeft zijn bewoners: vissen in het open water, Corydoras op de bodem, en garnalen, slakken en micro-organismen die organisch materiaal verwerken.',
    'work.project1.principle.p3':
      'CO₂ gebruik ik hier soms als experiment: 2 bpm tijdens de lichtperiode geeft de planten een extra duw. De basis draait ook zonder.',
    'work.project1.spec.started': 'Mei 2023',
    'work.project1.spec.dimensions': '200 × 65 × 75 cm',
    'work.project1.spec.volume': '1.000 L',
    'work.project1.spec.filtration': 'Intern · substraat op basis van puimsteen',
    'work.project1.spec.lighting': '2 lichtperiodes · 6 u + 4 u',
    'work.project1.spec.substrate': 'MA-Gen 1.0',
    'work.project1.spec.co2': '2 bpm tijdens de lichtperiode',
    'work.project1.spec.fish':
      'Hyphessobrycon pulchripinnis · Hyphessobrycon sweglesi · Nematobrycon palmeri · Carnegiella strigata · Corydoras elegans · Crossocheilus oblongus',
    'work.project1.spec.otherInhabitants': 'Amanogarnalen · Neocaridina · slakken · microfauna',
    'work.project1.spec.plants':
      'Echinodorus uruguayensis · Cryptocoryne wendtii · Cryptocoryne undulata · Hygrophila stricta · Bolbitis heudelotii',
    'work.project1.gallery.alt': 'Detail van Fallen Forest Microcosmos',

    'work.project2.image.alt': 'Orinoco-geïnspireerde littorale Microcosmos',
    'work.project2.eyebrow': '02 — Orinoco-geïnspireerde littorale zone',
    'work.project2.title': 'Waar land<br />en water elkaar ontmoeten.',
    'work.project2.intro':
      'Een aquarium naar de ondiepe oevers van het Orinoco-bekken, waar land, water en planten in elkaar overgaan.',
    'work.project2.story.p1':
      'Geïnspireerd op de rustige, tanninerijke wateren van het Orinocobekken brengt deze Microcosmos een stukje van de overgang tussen land en water naar binnen. Langbladige waterplanten, oevervegetatie, bladeren en hout vormen een gelaagd landschap waarin water en land in elkaar overvloeien.',
    'work.project2.story.p2':
      'In het open water bewegen <em>Nannostomus marginatus</em> zich rustig tussen de vegetatie. Ze hangen bijna stil in het water, vlak onder het oppervlak. Dichter bij de bodem leven <em>Apistogramma viejita</em>, die tussen bladeren en hout voortdurend hun omgeving onderzoeken en het fijne substraat afzoeken naar voedsel.',
    'work.project2.story.p3':
      'Tussen beide lagen bewegen <em>Ancistrus</em> zich langzaam over hout, bladeren en planten. Elke soort heeft zo zijn eigen plek en gedrag in de bak.',
    'work.project2.story.p4':
      'Het resultaat: een rustig, warm aquarium waarin altijd wel iets beweegt.',
    'work.project2.ecosystemEyebrow': 'Het ecosysteem',
    'work.project2.spec.started': 'December 2025',
    'work.project2.spec.dimensions': '72 × 60 × 60 cm',
    'work.project2.spec.volume': '220 L',
    'work.project2.spec.filtration': 'Intern · substraat op basis van puimsteen',
    'work.project2.spec.substrate': 'MA-Gen 1.2',
    'work.project2.spec.lighting': 'LED · 2 lichtperiodes · 6 u + 4 u',
    'work.project2.spec.co2': 'Geen',
    'work.project2.spec.fish': 'Nannostomus marginatus · Apistogramma viejita · Ancistrus brown',
    'work.project2.spec.otherInhabitants': 'Slakken · microfauna',
    'work.project2.spec.plants': 'Echinodorus bleheri · Eleocharis acicularis',
    'work.project2.gallery.alt': 'Detail van Orinoco-geïnspireerde Microcosmos',

    'work.project3.image.alt': 'Borneo Understory Microcosmos',
    'work.project3.eyebrow': '03 — Borneo Understory',
    'work.project3.title': 'Een bos<br />onder water.',
    'work.project3.intro':
      'Een nano-aquarium, geïnspireerd op de bosbodem en de ondiepe beekjes van Borneo.',
    'work.project3.story.p1':
      'Een netwerk van gevallen takken en wortels creëert een dichte driedimensionale structuur, terwijl Cryptocoryne en andere laagblijvende planten uit het zanderige substraat groeien. Zo krijgt het aquarium het karakter van een ondergedoken bosbodem.',
    'work.project3.story.p2':
      'Het geheel moet aanvoelen als die tropische bossen: beschaduwd, vochtig en rijk gelaagd.',
    'work.project3.story.p3':
      "Kleine groepen Chili Rasbora's bewegen rustig tussen de takken en vegetatie, terwijl blauwe garnalen het hout, de bladeren en het substraat verkennen en grazen op biofilm en micro-organismen.",
    'work.project3.story.p4':
      'Deze bak is gestart in augustus 2026. In het dagboek volg je hoe hij verder groeit.',
    'work.project3.ecosystemEyebrow': 'Het ecosysteem',
    'work.project3.spec.started': 'Augustus 2026',
    'work.project3.spec.dimensions': '40 × 40 × 40 cm',
    'work.project3.spec.volume': '60 L',
    'work.project3.spec.filtration': 'Intern · spons',
    'work.project3.spec.lighting': '10 uur lichtperiode',
    'work.project3.spec.substrate': 'MA-Gen 2.0',
    'work.project3.spec.co2': 'Geen',
    'work.project3.spec.fish': 'Chili Rasbora',
    'work.project3.spec.otherInhabitants': 'Neocaridina blue · microfauna',
    'work.project3.spec.plants':
      'Cryptocoryne wendtii (groen, rood en bruin) · Cryptocoryne undulata · Cryptocoryne beckettii · Cryptocoryne lucens · Cryptocoryne parva · Cryptocoryne petchii · Sagittaria subulata · Bolbitis heudelotii',
    'work.project3.gallery.alt': 'Detail van Borneo Understory Microcosmos',

    'work.closing.eyebrow':
      'Jouw aquarium',
    'work.closing.title': 'Misschien is de volgende<br />wel van jou.',
    'work.closing.text':
      'Zie je hier iets wat je ook thuis wilt, of heb je een heel ander idee? Vertel het me.',
    'work.closing.button': 'Start een gesprek',

    'home.meta.title': 'Microcosmos Atelier — Levende Aquatische Ecosystemen',
    'home.meta.description':
      'Aquaria die werken als een klein ecosysteem: vol planten, stabiel en gemaakt om jaren mee te gaan. Ontworpen en gebouwd door Kasper Masschaele.',

    'home.hero.imageAlt': 'Een levend aquatisch ecosysteem van Microcosmos Atelier',
    'home.hero.eyebrow': 'Levende aquatische ecosystemen',
    'home.hero.title': 'Een stukje<br />natuur, helemaal van jou.',
    'home.hero.text':
      'Ik ontwerp en bouw aquaria die werken als een klein ecosysteem: vol planten, stabiel, en gemaakt om jaren mee te gaan.',

    'home.intro.anchor': 'wat-is-een-microcosmos',
    'home.intro.eyebrow': 'Wat is een Microcosmos?',
    'home.intro.title':
      'Meer dan een aquarium.<br />Een klein ecosysteem in huis.',
    'home.intro.col1':
      'Een Microcosmos is een aquarium dat werkt als een klein ecosysteem, ontworpen voor jouw ruimte.',
    'home.intro.col2.p1':
      'Planten zuiveren het water, bacteriën in de bodem zetten afval om, garnalen en slakken ruimen op, en de vissen brengen beweging. Elk onderdeel heeft een taak.',
    'home.intro.col2.p2':
      "Zo'n systeem vraagt weinig ingrijpen en blijft jarenlang stabiel. Stilstaan doet het niet: planten groeien, er ontstaat nieuw leven, en dat maakt het boeiend om naar te kijken.",

    'home.philosophy.eyebrow': 'Het idee',
    'home.philosophy.title':
      'Een systeem dat zijn<br />eigen evenwicht vindt.',
    'home.philosophy.lead':
      'Een gezond aquarium draait op evenwicht: genoeg planten, de juiste bewoners, en tijd.',
    'home.philosophy.p1':
      'Ik zorg dat de basis klopt: een bodem waarin bacteriën zich goed vestigen, veel planten die de voedingsstoffen opnemen, en bewoners die bij elkaar en bij de bak passen.',
    'home.philosophy.p2':
      'Daarna laat ik het systeem zijn werk doen. De eerste maanden groeit het naar een evenwicht toe. Dat vraagt geduld, maar dan heb je een aquarium dat stabiel blijft zonder dat je voortdurend moet bijsturen.',
    'home.philosophy.p3':
      'Wat er op dag één mooi uitziet, ziet er een jaar later anders uit, en vaak nog mooier. In het dagboek volg ik hoe mijn eigen bakken evolueren.',

    'home.layer1.title': 'Water',
    'home.layer1.text': 'Het medium dat alles met elkaar verbindt.',
    'home.layer2.title': 'Planten',
    'home.layer2.text': 'Groei, structuur en verandering.',
    'home.layer3.title': 'Substraat',
    'home.layer3.text': 'De basis voor wortels en microbieel leven.',
    'home.layer4.title': 'Micro-organismen',
    'home.layer4.text': 'De onzichtbare motor van het ecosysteem.',
    'home.layer5.title': 'Ongewervelden',
    'home.layer5.text': 'Grazers, opruimers en bewoners.',
    'home.layer6.title': 'Vissen',
    'home.layer6.text': 'Beweging, gedrag en karakter.',

    'home.inspiration.eyebrow': 'Inspiratie',
    'home.inspiration.title': 'Waar zou je<br />naartoe willen?',
    'home.inspiration.text':
      "Een Microcosmos kan vele vormen aannemen. Deze beelden zijn visuele interpretaties die verschillende richtingen verkennen — inspiratie, geen foto's van bestaande projecten.",

    'home.inspiration1.imageAlt': 'Op een jungle geïnspireerde Microcosmos',
    'home.inspiration1.eyebrow': 'Inspiratie 01',
    'home.inspiration1.title': 'Forest',
    'home.inspiration1.text':
      'Weelderige vegetatie, gelaagd groen en het gevoel volledig ondergedompeld te zijn in een tropisch woud.',

    'home.inspiration2.imageAlt': 'Op de Amazone geïnspireerde Microcosmos',
    'home.inspiration2.eyebrow': 'Inspiratie 02',
    'home.inspiration2.title': 'Littoral',
    'home.inspiration2.text':
      'Waar land en water elkaar ontmoeten — wortels, vegetatie, open water en natuurlijke overgangen.',

    'home.inspiration3.imageAlt': 'Op zwartwater geïnspireerde Microcosmos',
    'home.inspiration3.eyebrow': 'Inspiratie 03',
    'home.inspiration3.title': 'Blackwater',
    'home.inspiration3.text':
      'Donkerder water, natuurlijke tannines, hout en de stille, mysterieuze sfeer van tropische rivieren.',

    'home.inspiration4.imageAlt': 'Een volledig persoonlijke Microcosmos',
    'home.inspiration4.eyebrow': 'Inspiratie 04',
    'home.inspiration4.title': 'Jouw eigen wereld',
    'home.inspiration4.text':
      'Begin met een plek, een herinnering, een ecosysteem — of gewoon met een gevoel.',

    'home.process.eyebrow': 'Van idee naar ecosysteem',
    'home.process.title': 'Ontworpen rond<br />jouw wereld.',

    'home.process1.title':
      'Kennismaking',
    'home.process1.text':
      'We beginnen met een gratis, vrijblijvend gesprek en een bezoek aan je ruimte. Waar komt het te staan, hoe valt het licht, en wat wil je voelen als je ernaar kijkt?',
    'home.process2.title':
      'Ontwerp en voorstel',
    'home.process2.text':
      'Ik maak een ontwerp met een eerste voorstel. Samen verfijnen we het tot een gedetailleerd voorstel: indeling, materialen, planten en bewoners.',
    'home.process3.title':
      'Bouw en installatie',
    'home.process3.text':
      'Ik bouw alles op als één samenhangend systeem, van substraat tot beplanting. Reken op ongeveer 6 tot 10 weken, vooral afhankelijk van de levering van het aquarium.',
    'home.process4.title':
      'Het ecosysteem komt tot leven',
    'home.process4.text':
      'Na de oplevering komt het systeem tot rust en groeit het verder. Over 2 tot 3 maanden komen de vissen erbij.',

    'home.formulas.eyebrow': 'Hoe we kunnen samenwerken',
    'home.formulas.title':
      'Wat ik doe,<br />en wat jij kiest.',
    'home.formulas.text':
      'Voor de zorg na de oplevering kies jij hoe betrokken je wilt zijn.',

    'home.formula1.title':
      'Ik zorg ervoor',
    'home.formula1.text':
      'Met een maandelijks servicecontract doe ik al het onderhoud. Jij geniet ervan en geeft enkel de vissen te eten.',
    'home.formula2.title':
      'Jij zorgt, ik help',
    'home.formula2.text':
      'Je onderhoudt het zelf. Heb je vragen of hulp nodig, dan roep je me in wanneer het nodig is, en werk ik in regie.',
    'home.formula3.title':
      'Op maat',
    'home.formula3.text':
      'Voor bijzondere ruimtes, grote installaties, een paludarium of een heel specifiek idee zoeken we samen de juiste aanpak.',
    'home.formulas.included': 'Altijd inbegrepen: ontwerp · samenstelling · bouw',
    'home.process.faqLink': 'Meer over het verloop in de veelgestelde vragen',
    'home.formulas.cta': 'Start een gesprek',

    'home.work.eyebrow':
      'Mijn werk',
    'home.work.title':
      'Mijn eigen aquaria.',
    'home.work.text':
      'Deze aquaria staan bij mij thuis, in mijn atelier. Sommige draaien al jaren.',
    'home.work.image1.alt': 'Fallen Forest Microcosmos',
    'home.work.image2.alt': 'Op de Orinoco geïnspireerde Littoral Zone Microcosmos',
    'home.work.image3.alt': 'Borneo Understory Microcosmos',
    'home.work.image4.alt': 'Ondiepe rivierbedding Microcosmos',
    'home.work.cta': 'Bekijk de projecten',
    'home.journal.eyebrow': 'Uit het dagboek',
    'home.journal.title': 'Laatst in het dagboek.',
    'home.journal.text': 'Hoe mijn aquaria groeien en veranderen, van opstart tot een stabiel ecosysteem.',
    'home.journal.cta': 'Naar het dagboek',

    'home.about.eyebrow': 'Over mij',
    'home.about.title':
      'Begonnen met<br />een goudvissenkom.',
    'home.about.p1':
      'Mijn eerste aquarium was een kom met goudvissen, gewonnen op de kermis toen ik vijf was. Ik ben er nooit meer mee gestopt.',
    'home.about.p2':
      'Deze zomer ben ik Microcosmos Atelier gestart, om anderen te helpen aan een aquarium dat jarenlang gezond blijft.',
    'home.about.link': 'Meer over mij',

    'home.cta.eyebrow':
      'Contact',
    'home.cta.title':
      'Heb je een plek in gedachten?',
    'home.cta.text':
      'Je hoeft nog niet precies te weten wat je wilt. Vertel me over je ruimte en je idee, dan bekijken we samen wat mogelijk is.',
    'home.cta.button': 'Start een gesprek',

    'journal.meta.title': 'Dagboek — Microcosmos Atelier',
    'journal.meta.description':
      'Volg de evolutie van elke Microcosmos, van opstart tot rijp ecosysteem.',
    'journal.hero.eyebrow': 'Dagboek',
    'journal.hero.title': 'Levende systemen,<br />in de tijd gevolgd.',
    'journal.hero.text':
      'Een Microcosmos is nooit af. Hier houd ik bij hoe elke bak zich ontwikkelt — een nieuwe aanplant, een omslag in het water, een systeem dat langzaam zijn evenwicht vindt.',
    'journal.filter.all': 'Alle bakken',
    'journal.status.opstart': 'Opstart',
    'journal.status.groeit': 'Groei',
    'journal.status.rijpt': 'Rijpt',
    'journal.status.stabiel': 'Stabiel',
    'journal.back': 'Terug naar het dagboek',
    'journal.empty': 'Nog geen observaties.',
    'journal.photoAltFallback': '{title} — foto {n}',

  },
  en: {
    'nav.ourWork':
      'Projects',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.journal': 'Journal',
    'nav.faq': 'FAQ',
    'nav.menu': 'Menu',
    'nav.backToTop': 'Back to top',
    'nav.skipToContent': 'Skip to content',
    'analytics.off': 'This device is no longer counted in the statistics.',
    'analytics.on': 'This device is counted in the statistics again.',
    'analytics.noStorage': 'This choice can\'t be remembered in this browser (private window?).',

    'footer.copyright': 'Microcosmos Atelier',
    'footer.privacy': 'Privacy',
    'faq.meta.title': 'Frequently asked questions — Microcosmos Atelier',
    'faq.meta.description': 'Answers about price, process, timing, area, maintenance and more for a tailor-made Microcosmos.',
    'faq.eyebrow': 'Frequently asked questions',
    'faq.title': 'Good to know.',
    'faq.lead': "A few questions I'm often asked. Is yours not here? Feel free to ask.",
    'faq.closing.title': 'Another question?',
    'faq.closing.text': "Every space and every idea is different. Tell me what you have in mind and we'll look at it together.",
    'faq.closing.button': 'Start a conversation',
    'faq.link': 'Frequently asked questions',
    'notFound.meta.title': 'Page not found — Microcosmos Atelier',
    'notFound.meta.description': 'This page doesn’t exist (anymore).',
    'notFound.eyebrow': 'Page not found',
    'notFound.title': 'This page doesn’t exist (anymore).',
    'notFound.text': 'It may have moved, or there’s a typo in the address. You can continue here:',
    'notFound.home': 'Go to the home page',
    'notFound.english': 'This page doesn’t exist (anymore).',
    'notFound.englishLink': 'Go to the English home page',
    'footer.faq': 'FAQ',
    'faq.q1': 'What does a Microcosmos cost?',
    'faq.a1':
      'Every Microcosmos is unique, so there is no fixed price. It mainly depends on the size of the aquarium, the cabinet and technology (filter, lighting, heating and CO₂ if needed), the wood and stone, the plants and animals, and whether you look after it yourself or leave the care to me. After a first conversation, I make a tailored proposal.',
    'faq.q2': 'How does a project work?',
    'faq.a2':
      "It starts with a conversation and a visit to your space. Then I make a design with a first proposal, followed by a detailed proposal. After that come the build, the installation and the handover. If you'd like me to keep looking after it afterwards, that's possible too.",
    'faq.q3': 'How long does it take?',
    'faq.a3':
      'If nothing in your interior needs to change, count on about 6 to 10 weeks; that mainly depends on the delivery of the aquarium. After that the ecosystem keeps growing calmly: the fish are added over a period of 2 to 3 months.',
    'faq.q4': 'Which area do you work in?',
    'faq.a4':
      "Mainly the provinces of Antwerp, East Flanders and Flemish Brabant. Do you live further away? Let me know and we'll see what's possible.",
    'faq.q5': 'Is the first conversation without obligation?',
    'faq.a5':
      'Yes. The first conversation is free and without any obligation.',
    'faq.q6': 'How much maintenance does it need, and can you do it?',
    'faq.a6':
      "You can leave all the maintenance to me with a monthly service contract; you then only feed the fish. If you'd rather do it yourself, you can call on me whenever you need help, and I work on a time-and-materials basis.",
    'faq.q7': 'What if I go on holiday?',
    'faq.a7':
      "If you're away for more than a week, I can install an automatic feeder. We can postpone the maintenance or simply keep it going; that depends on the situation and on the ecosystem. A newly started aquarium needs more care than an ecosystem that has been running for years.",
    'faq.q8': 'Can you redesign my existing aquarium?',
    'faq.a8':
      'Yes, I can redesign an existing aquarium. Because every aquarium is different, I look at it case by case.',
    'faq.q9': 'Is it suitable with children or pets at home?',
    'faq.a9':
      "Certainly. As long as nothing ends up in the aquarium and other animals can't get into it, a Microcosmos is a lovely addition to the whole home.",
    'faq.q10': 'How much electricity does it use?',
    'faq.a10':
      'That mainly depends on the temperature of your room, the water temperature the inhabitants need and the volume of water to be heated. Lighting and pumps use fairly little these days.',
    'faq.q11': 'Can it be without fish, or a paludarium?',
    'faq.a11':
      "Certainly, that's open to discussion: an aquarium with only plants, or a paludarium with water and land, can become a living ecosystem just as well.",
    'privacy.meta.title': 'Privacy — Microcosmos Atelier',
    'privacy.meta.description': 'What data Microcosmos Atelier collects, why and for how long.',
    'privacy.eyebrow': 'Privacy',
    'privacy.title': 'Your data, simply explained.',
    'privacy.lead': 'This site collects as little as possible. Here is what, why and for how long.',
    'privacy.form.title': 'The contact form',
    'privacy.form.text':
      'When you fill in the contact form, I receive your name, your email address, what you have in mind, your message and the language you wrote in. I only use these details to reply to your enquiry. The form is processed and stored by Netlify, which hosts this site. I delete enquiries after about a year.',
    'privacy.stats.title': 'Visitor statistics',
    'privacy.stats.text':
      'To see how many people visit the site and which pages they read, I use Cloudflare Web Analytics. It measures anonymously and in totals: which page, which site you came from, your country and the type of device. No cookies are used, you are not recognised and not followed across other sites.',
    'privacy.cookies.title': 'Cookies',
    'privacy.cookies.text': 'This site sets no cookies.',
    'privacy.questions.title': 'Questions',
    'privacy.questions.text':
      'Do you have a question about your data, or would you like me to delete it?',
    'privacy.questions.link': 'Let me know through the contact form.',
    'contact.form.privacyLink': 'More about privacy',

    'about.meta.title': 'About — Microcosmos Atelier',
    'about.meta.description':
      'Who is behind Microcosmos Atelier: Kasper Masschaele, hooked on aquariums since he was five.',
    'about.image.alt': 'Kasper Masschaele',
    'about.hero.eyebrow':
      'About me',
    'about.hero.title':
      'Hooked since<br />I was five.',
    'about.hero.lead':
      "It started with a bowl of goldfish I won at the fair. I've kept aquariums ever since, and learned step by step how to turn one into a small ecosystem that keeps itself in balance.",
    'about.story.eyebrow': 'The story',
    'about.story.title':
      'From goldfish bowl<br />to ecosystem.',
    'about.story.p1':
      "As a child I mostly watched the fish. Later my attention went to what you don't see at first: the plants that clean the water, the bacteria in the substrate, the shrimp and snails that tidy up. Only when all of them work together does an aquarium stay healthy for years.",
    'about.story.p2':
      "That's still how I work today. I build a system that regulates itself: lots of plants that grow well, year after year, without pushing them with CO₂ or lots of fertiliser. Sometimes I do experiment with a little CO₂. It creates a different balance and stronger growth, but the basis has to work without it.",
    'about.story.p3':
      'The aquariums on this site are all in my own home, in my atelier. Some have been running for years. They are the best proof that this approach works.',
    'about.story.p4':
      'This summer I started Microcosmos Atelier to do the same for others: a beautiful, healthy ecosystem in your home, one that lasts.',
    'about.story.p5':
      "And you don't need to become an expert. I follow up your aquarium with you, so you're fully taken care of, with no learning curve. After all these years I can read an aquarium: I quickly see what's going on and what it needs.",
    'about.story.linkedinText':
      'More about me on',
    'about.story.linkedinLabel':
      'LinkedIn',
    'about.story.highlight2':
      'Stable ecosystems that keep evolving over time.',
    'about.cta.eyebrow':
      'Getting started',
    'about.cta.title':
      'Would you like a Microcosmos of your own?',
    'about.cta.text':
      'Tell me what you have in mind. The first conversation is free and without obligation.',
    'about.cta.button': 'Start a conversation',

    'contact.meta.title': 'Contact — Microcosmos Atelier',
    'contact.meta.description':
      'Get in touch with Microcosmos Atelier for a first, no-obligation conversation about a tailor-made aquarium.',
    'contact.hero.eyebrow': 'Get in touch',
    'contact.hero.title':
      "Let's get<br />acquainted.",
    'contact.hero.lead':
      "Fill in the form and I'll get in touch to arrange a first conversation. That conversation is free and without obligation.",
    'contact.info.eyebrow': 'Start a conversation',
    'contact.info.title':
      'What do we talk about?',
    'contact.info.text':
      "Your space and where the aquarium could go, what you find beautiful, how big it can be, and how much you'd like to do yourself or leave to me. You don't need to know anything exactly yet.",
    'contact.form.subject': 'New Microcosmos Atelier enquiry',
    'contact.form.name.label': 'Name',
    'contact.form.email.label': 'Email',
    'contact.form.project.label': 'What are you thinking about?',
    'contact.form.project.placeholder': 'Select an option',
    'contact.form.project.new': 'A new Microcosmos',
    'contact.form.project.existing': 'Transforming an existing aquarium',
    'contact.form.project.maintenance': 'Ongoing care / stewardship',
    'contact.form.project.tailored': 'A tailored project',
    'contact.form.project.exploring': "I'm just exploring the possibilities",
    'contact.form.message.label': 'Tell me a little more',
    'contact.form.message.placeholder':
      "Tell me about your space, your idea or what you'd like to create...",
    'contact.form.required': 'required',
    'contact.form.privacy': 'I only use your details to reply to your enquiry.',
    'contact.form.honeypot': 'Leave this field empty',
    'contact.form.submit': 'Send enquiry',

    'contact.thanks.meta.title': 'Thank you — Microcosmos Atelier',
    'contact.thanks.meta.description': 'Your enquiry has been sent.',
    'contact.thanks.eyebrow': 'Enquiry sent',
    'contact.thanks.title': 'Thank you for your message.',
    'contact.thanks.text':
      'I read every enquiry myself and will reply by email as soon as I can.',
    'contact.thanks.back': 'Back to the home page',

    'work.spec.started': 'Started',
    'work.spec.dimensions': 'Dimensions',
    'work.spec.volume': 'Volume',
    'work.spec.filtration': 'Filtration',
    'work.spec.lighting': 'Lighting',
    'work.spec.substrate': 'Substrate',
    'work.spec.co2': 'CO₂',
    'work.spec.fish': 'Fish',
    'work.spec.otherInhabitants': 'Other inhabitants',
    'work.spec.plants': 'Plants',

    'work.meta.title':
      'Projects — Microcosmos Atelier',
    'work.meta.description':
      'Three Microcosmos Atelier aquariums in detail: layout, plants, inhabitants and technology.',
    'work.hero.eyebrow':
      'Projects',
    'work.hero.title':
      'Three aquariums,<br />in my own home.',
    'work.hero.text':
      'The best way to see how I work is in my own tanks: lots of plants, inhabitants that suit each other, and a system that stays stable for years.',

    'work.jump.label': 'Projects on this page',

    'work.project1.image.alt': 'Fallen Forest Microcosmos',
    'work.project1.eyebrow': '01 — Fallen Forest',
    'work.project1.title': 'A forest floor,<br />brought underwater.',
    'work.project1.intro':
      'A two-metre, 1,000-litre aquarium in the living room, inspired by a fallen tree in a tropical forest and the dense vegetation that grows around it.',
    'work.project1.story.p1':
      'The layout follows that fallen tree: open spaces between the branches, different layers of vegetation, and life around wood and leaves that slowly break down.',
    'work.project1.story.p2':
      'Large groups of lemon tetras, emperor tetras and hatchetfish bring movement to the open water, each occupying a different part of the water column.',
    'work.project1.story.p3':
      'The tetras move through the central spaces between the branches and vegetation, while the hatchetfish remain close to the surface. Corydoras constantly explore the lower layers, sifting through leaf litter and substrate in search of food.',
    'work.project1.story.p4':
      "Above the water, Monstera and Pothos grow out of the aquarium, drawing nutrients directly from the water. Shrimp, snails and microorganisms occupy the less visible layers of the ecosystem, processing organic matter and contributing to the system's nutrient cycles.",
    'work.project1.story.p5':
      'The tank has been running since 2023. Plants grow, populations change, and the whole thing matures a little more every year.',
    'work.project1.ecosystemEyebrow': 'The ecosystem',
    'work.project1.principle.p1':
      'Lots of plants, below and above the water, take up the nutrients produced by the fish and by decaying leaves and wood. That keeps the water stable.',
    'work.project1.principle.p2':
      'Each layer has its inhabitants: fish in the open water, Corydoras on the bottom, and shrimp, snails and microorganisms processing organic matter.',
    'work.project1.principle.p3':
      'I sometimes use CO₂ here as an experiment: 2 bpm during the light period gives the plants an extra push. The basis also works without it.',
    'work.project1.spec.started': 'May 2023',
    'work.project1.spec.dimensions': '200 × 65 × 75 cm',
    'work.project1.spec.volume': '1,000 L',
    'work.project1.spec.filtration': 'Internal · pumice-based substrate',
    'work.project1.spec.lighting': '2 photoperiods · 6 h + 4 h',
    'work.project1.spec.substrate': 'MA-Gen 1.0',
    'work.project1.spec.co2': '2 bpm during photoperiod',
    'work.project1.spec.fish':
      'Hyphessobrycon pulchripinnis · Hyphessobrycon sweglesi · Nematobrycon palmeri · Carnegiella strigata · Corydoras elegans · Crossocheilus oblongus',
    'work.project1.spec.otherInhabitants': 'Amano shrimp · Neocaridina · snails · microfauna',
    'work.project1.spec.plants':
      'Echinodorus uruguayensis · Cryptocoryne wendtii · Cryptocoryne undulata · Hygrophila stricta · Bolbitis heudelotii',
    'work.project1.gallery.alt': 'Fallen Forest Microcosmos detail',

    'work.project2.image.alt': 'Orinoco-inspired littoral Microcosmos',
    'work.project2.eyebrow': '02 — Orinoco-inspired littoral zone',
    'work.project2.title': 'Where land<br />meets water.',
    'work.project2.intro':
      'An aquarium modelled on the shallow banks of the Orinoco basin, where land, water and plants merge into one another.',
    'work.project2.story.p1':
      'Inspired by the quiet, tannin-rich waters of the Orinoco basin, this Microcosmos brings a fragment of the transition between land and water indoors. Long-leaved aquatic plants, riparian vegetation, fallen leaves and wood create a layered landscape where water and land flow into one another.',
    'work.project2.story.p2':
      'In the open water, <em>Nannostomus marginatus</em> move gently among the vegetation. They hang almost motionless in the water, just below the surface. Closer to the substrate, <em>Apistogramma viejita</em> explore the spaces between leaves and wood, constantly investigating their surroundings and sifting through the fine substrate for food.',
    'work.project2.story.p3':
      'Between those layers, <em>Ancistrus</em> move slowly over wood, leaves and plants. Each species has its own place and behaviour in the tank.',
    'work.project2.story.p4':
      'The result: a calm, warm aquarium where something is always moving.',
    'work.project2.ecosystemEyebrow': 'The ecosystem',
    'work.project2.spec.started': 'December 2025',
    'work.project2.spec.dimensions': '72 × 60 × 60 cm',
    'work.project2.spec.volume': '220 L',
    'work.project2.spec.filtration': 'Internal · pumice-based substrate',
    'work.project2.spec.substrate': 'MA-Gen 1.2',
    'work.project2.spec.lighting': 'LED · 2 light periods · 6 h + 4 h',
    'work.project2.spec.co2': 'None',
    'work.project2.spec.fish': 'Nannostomus marginatus · Apistogramma viejita · Ancistrus brown',
    'work.project2.spec.otherInhabitants': 'Snails · microfauna',
    'work.project2.spec.plants': 'Echinodorus bleheri · Eleocharis acicularis',
    'work.project2.gallery.alt': 'Detail of Orinoco-inspired Microcosmos',

    'work.project3.image.alt': 'Borneo Understory Microcosmos',
    'work.project3.eyebrow': '03 — Borneo Understory',
    'work.project3.title': 'A forest<br />beneath the water.',
    'work.project3.intro':
      'A nano aquarium, inspired by the forest floor and the shallow streams of Borneo.',
    'work.project3.story.p1':
      'A network of fallen branches and roots creates a dense three-dimensional structure, while Cryptocoryne and other low-growing plants emerge from the sandy substrate, giving the aquarium the character of a submerged forest understory.',
    'work.project3.story.p2':
      'The whole should feel like those tropical forests: shaded, humid and richly layered.',
    'work.project3.story.p3':
      'Small groups of Chili Rasboras move quietly between the branches and vegetation, while blue shrimp explore the wood, leaves and substrate, grazing on biofilm and microorganisms.',
    'work.project3.story.p4':
      'This tank was started in August 2026. You can follow how it grows in the journal.',
    'work.project3.ecosystemEyebrow': 'The ecosystem',
    'work.project3.spec.started': 'August 2026',
    'work.project3.spec.dimensions': '40 × 40 × 40 cm',
    'work.project3.spec.volume': '60 L',
    'work.project3.spec.filtration': 'Internal · sponge',
    'work.project3.spec.lighting': '10 hour photoperiod',
    'work.project3.spec.substrate': 'MA-Gen 2.0',
    'work.project3.spec.co2': 'None',
    'work.project3.spec.fish': 'Chili Rasbora',
    'work.project3.spec.otherInhabitants': 'Neocaridina blue · microfauna',
    'work.project3.spec.plants':
      'Cryptocoryne wendtii (green, red and brown) · Cryptocoryne undulata · Cryptocoryne beckettii · Cryptocoryne lucens · Cryptocoryne parva · Cryptocoryne petchii · Sagittaria subulata · Bolbitis heudelotii',
    'work.project3.gallery.alt': 'Borneo Understory Microcosmos detail',

    'work.closing.eyebrow':
      'Your aquarium',
    'work.closing.title': 'Perhaps the next<br />one is yours.',
    'work.closing.text':
      'See something here you would like at home, or do you have a completely different idea? Tell me about it.',
    'work.closing.button': 'Start a conversation',

    'home.meta.title': 'Microcosmos Atelier — Living Aquatic Ecosystems',
    'home.meta.description':
      'Aquariums that work as a small ecosystem: full of plants, stable and made to last for years. Designed and built by Kasper Masschaele.',

    'home.hero.imageAlt': 'A living aquatic ecosystem by Microcosmos Atelier',
    'home.hero.eyebrow': 'Living aquatic ecosystems',
    'home.hero.title': 'A little piece<br />of nature, made yours.',
    'home.hero.text':
      'I design and build aquariums that work as a small ecosystem: full of plants, stable, and made to last for years.',

    'home.intro.anchor': 'what-is-a-microcosmos',
    'home.intro.eyebrow': 'What is a Microcosmos?',
    'home.intro.title':
      'More than an aquarium.<br />A small ecosystem at home.',
    'home.intro.col1':
      'A Microcosmos is an aquarium that works as a small ecosystem, designed for your space.',
    'home.intro.col2.p1':
      'Plants clean the water, bacteria in the substrate break down waste, shrimp and snails tidy up, and the fish bring movement. Every part has a job.',
    'home.intro.col2.p2':
      "A system like this needs little intervention and stays stable for years. It doesn't stand still, though: plants grow, new life appears, and that makes it a pleasure to watch.",

    'home.philosophy.eyebrow': 'The idea',
    'home.philosophy.title':
      'A system that finds<br />its own balance.',
    'home.philosophy.lead':
      'A healthy aquarium runs on balance: enough plants, the right inhabitants, and time.',
    'home.philosophy.p1':
      'I make sure the basics are right: a substrate where bacteria can settle, lots of plants that take up the nutrients, and inhabitants that suit each other and the tank.',
    'home.philosophy.p2':
      'Then I let the system do its work. In the first months it grows towards a balance. That takes patience, but then you have an aquarium that stays stable without constant adjusting.',
    'home.philosophy.p3':
      'What looks beautiful on day one looks different a year later, and often even better. In the journal I follow how my own tanks evolve.',

    'home.layer1.title': 'Water',
    'home.layer1.text': 'The medium connecting everything.',
    'home.layer2.title': 'Plants',
    'home.layer2.text': 'Growth, structure and transformation.',
    'home.layer3.title': 'Substrate',
    'home.layer3.text': 'A foundation for roots and microbial life.',
    'home.layer4.title': 'Microorganisms',
    'home.layer4.text': 'The invisible engine of the ecosystem.',
    'home.layer5.title': 'Invertebrates',
    'home.layer5.text': 'Grazers, recyclers and inhabitants.',
    'home.layer6.title': 'Fish',
    'home.layer6.text': 'Movement, behaviour and character.',

    'home.inspiration.eyebrow': 'Inspiration',
    'home.inspiration.title': 'Where would you<br />like to go?',
    'home.inspiration.text':
      'A Microcosmos can take many forms. These images are visual interpretations created to explore different directions — they are inspiration, not photographs of existing projects.',

    'home.inspiration1.imageAlt': 'Jungle-inspired Microcosmos',
    'home.inspiration1.eyebrow': 'Inspiration 01',
    'home.inspiration1.title': 'Forest',
    'home.inspiration1.text':
      'Lush vegetation, layered greenery and the feeling of being immersed in a tropical forest.',

    'home.inspiration2.imageAlt': 'Amazon-inspired Microcosmos',
    'home.inspiration2.eyebrow': 'Inspiration 02',
    'home.inspiration2.title': 'Littoral',
    'home.inspiration2.text':
      'The meeting of land and water — roots, vegetation, open water and natural transitions.',

    'home.inspiration3.imageAlt': 'Blackwater-inspired Microcosmos',
    'home.inspiration3.eyebrow': 'Inspiration 03',
    'home.inspiration3.title': 'Blackwater',
    'home.inspiration3.text':
      'Darker waters, natural tannins, wood and the quiet, mysterious atmosphere of tropical rivers.',

    'home.inspiration4.imageAlt': 'A fully bespoke Microcosmos',
    'home.inspiration4.eyebrow': 'Inspiration 04',
    'home.inspiration4.title': 'Your own little world',
    'home.inspiration4.text': 'Start with a place, a memory, an ecosystem — or simply a feeling.',

    'home.process.eyebrow': 'From idea to ecosystem',
    'home.process.title': 'Designed around<br />your world.',

    'home.process1.title':
      'Getting to know each other',
    'home.process1.text':
      'We start with a free, no-obligation conversation and a visit to your space. Where will it live, what is the light like, and what do you want to feel when you look at it?',
    'home.process2.title':
      'Design and proposal',
    'home.process2.text':
      'I make a design with a first proposal. Together we refine it into a detailed proposal: layout, materials, plants and inhabitants.',
    'home.process3.title':
      'Build and installation',
    'home.process3.text':
      'I build everything as one coherent system, from substrate to planting. Count on about 6 to 10 weeks, mainly depending on the delivery of the aquarium.',
    'home.process4.title':
      'The ecosystem comes to life',
    'home.process4.text':
      'After the handover, the system settles and keeps growing. Over 2 to 3 months, the fish are added.',

    'home.formulas.eyebrow': 'How we can work together',
    'home.formulas.title':
      'What I do,<br />and what you choose.',
    'home.formulas.text':
      'For the care after the handover, you choose how involved you want to be.',

    'home.formula1.title':
      'I take care of it',
    'home.formula1.text':
      'With a monthly service contract, I do all the maintenance. You simply enjoy it and only feed the fish.',
    'home.formula2.title':
      'You care, I help',
    'home.formula2.text':
      'You look after it yourself. If you have questions or need a hand, you call on me whenever needed, on a time-and-materials basis.',
    'home.formula3.title':
      'Tailored',
    'home.formula3.text':
      'For unusual spaces, large installations, a paludarium or a very specific idea, we find the right approach together.',
    'home.formulas.included': 'Always included: design · composition · build',
    'home.process.faqLink': 'More about the process in the FAQ',
    'home.formulas.cta': 'Start a conversation',

    'home.work.eyebrow':
      'My work',
    'home.work.title':
      'My own aquariums.',
    'home.work.text':
      'These aquariums are in my own home, in my atelier. Some have been running for years.',
    'home.work.image1.alt': 'Fallen Forest Microcosmos',
    'home.work.image2.alt': 'Orinoco-inspired Littoral Zone Microcosmos',
    'home.work.image3.alt': 'Borneo Understory Microcosmos',
    'home.work.image4.alt': 'Shallow riverbed Microcosmos',
    'home.work.cta': 'Explore the projects',
    'home.journal.eyebrow': 'From the journal',
    'home.journal.title': 'Latest from the journal.',
    'home.journal.text': 'How my aquariums grow and change, from start-up to a stable ecosystem.',
    'home.journal.cta': 'Go to the journal',

    'home.about.eyebrow': 'About',
    'home.about.title':
      'It started with<br />a goldfish bowl.',
    'home.about.p1':
      "My first aquarium was a bowl of goldfish, won at the fair when I was five. I've never stopped since.",
    'home.about.p2':
      'This summer I started Microcosmos Atelier to help others to an aquarium that stays healthy for years.',
    'home.about.link': 'More about me',

    'home.cta.eyebrow':
      'Contact',
    'home.cta.title':
      'Do you have a place in mind?',
    'home.cta.text':
      "You don't need to know exactly what you want yet. Tell me about your space and your idea, and we'll look at what's possible together.",
    'home.cta.button': 'Start a conversation',

    'journal.meta.title': 'Journal — Microcosmos Atelier',
    'journal.meta.description':
      'Follow the evolution of each Microcosmos, from setup to mature ecosystem.',
    'journal.hero.eyebrow': 'Journal',
    'journal.hero.title': 'Living systems,<br />followed over time.',
    'journal.hero.text':
      'A Microcosmos is never finished. This is where I record how each aquarium develops — a new planting, a shift in the water, a system slowly finding its balance.',
    'journal.filter.all': 'All aquariums',
    'journal.status.opstart': 'Setup',
    'journal.status.groeit': 'Growing',
    'journal.status.rijpt': 'Maturing',
    'journal.status.stabiel': 'Established',
    'journal.back': 'Back to the journal',
    'journal.empty': 'No observations yet.',
    'journal.photoAltFallback': '{title} — photo {n}',
  },
} as const;
