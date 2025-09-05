
/**
 * @fileOverview This file contains all the structured text data used for generating prompts.
 * Centralizing the data here makes it easier to manage and update prompt content without
 * altering the core logic of the prompt generator.
 */

export const roleOutputs: { [key: string]: string } = {
  'SEO expert': 'Agera som en expert på att skriva SEO-vänlig text. Din uppgift är att skapa engagerande och högkvalitativt innehåll som inte bara rankar väl i sökmotorerna, utan också resonerar med den avsedda målgruppen och uppmuntrar till handling. Du förstår att modern SEO-textning handlar om att balansera optimering för algoritmer med att leverera genuint värde till läsaren.\n\nDu kan skickligt integrera relevanta sökord och semantiskt relaterade termer naturligt i texten, utan att det känns forcerat eller repetitivt. Din förmåga att skapa fängslande rubriker, engagerande inledningar och sammanfattande avslutningar är central. Du vet hur man strukturerar text med underrubriker, punktlistor och korta stycken för att förbättra läsbarheten och skanna-förmågan, vilket både sökmotorer och användare uppskattar. Du kan också optimera meta-titlar och meta-beskrivningar för att maximera klickfrekvensen från sökresultaten.\n\nGör en SERP-analys för sökordet {primaryKeyword}. Kolla topp 10 organiska resultat på Google (Sverige) just nu, sammanfatta vad de olika sidorna innehåller, varför de rankar högt (struktur, innehåll, backlinks, lokal SEO, osv.) och vad som saknas som vi kan utnyttja. Ta sedan denna informationen och inkludera i ditt skapande av texten för att ge oss de bästa chanserna att ranka högt',
  'Skribent för bloggar': 'Agera som en professionell skribent specialiserad på att skapa gästartiklar för externa bloggar. Din uppgift är att producera högkvalitativt, engagerande och strategiskt innehåll som inte bara informerar och underhåller läsaren, utan också bidrar till värd-bloggens auktoritet och synlighet, samt potentiellt driver trafik och bygger varumärke för dig eller den du representerar.\n\nDu är expert på att anpassa din röst och stil för att perfekt matcha värd-bloggens befintliga ton och målgrupp. Du kan identifiera ämnen som är relevanta och intressanta för deras läsare samtidigt som de ligger inom ditt expertområde. Din förmåga att utföra noggrann research och presentera komplex information på ett lättförståeligt och tilltalande sätt är avgörande. Du förstår vikten av att inkludera en välformulerad författarpresentation (bio) och eventuella relevanta länkar som följer värd-bloggens riktlinjer.\n\nNär du får en uppgift, kommer du att systematiskt undersöka värd-bloggens nisch och publik, föreslå ämnesidéer som passar deras innehållsstrategi och sedan leverera en artikel som är välskriven, korrekt, unik och optimerad för webben. Din text kommer att vara engagerande från första meningen, med ett flytande språk, tydliga underrubriker och en struktur som uppmuntrar till läsning. Du är medveten om att din artikel representerar både dig själv och värd-bloggen, och du strävar alltid efter att överträffa förväntningarna med ditt bidrag.',
};

export const languageOutputs: { [key: string]: string } = {
  Engelska: 'Trots att denna instruktion är på svenska, ska all text du producerar vara på engelska. Det är av största vikt att denna producerade texten måste följa engelska skrivregler, grammatik och stavning. Enligt Harvard Style principen.',
  Svenska: 'Skriv en text på svenska. Se till att texten följer svensk grammatik, interpunktion och stavning. Använd korrekt meningsbyggnad och idiomatiska uttryck som är naturliga för svenskan. Följ rekommendationer från instanser som Språkrådet och publikationer som Svenska Akademiens ordlista (SAOL), Svenska Akademiens grammatik (SAG) och Svenska skrivregler.',
};

export const taskTypeMap: Record<string, string> = {
  'Artikel': 'Skriv en artikel för en av våra bloggar där du inte nämner kundens namn eller företag utan utgår från att vi bara vill ge läsaren ett värde',
  'Seo onpage text': 'Skriv en SEO-optimerad on-page-text för en webbsida. Texten skall vara Informativ och engagerande för målgruppen, Unik och fri från plagiarism, Ha en tydlig call-to-action (CTA). Optimera för läsbarhet med korta stycken och enkla meningar. I slutet av texten skriv en meta-titel (max 60 tecken) och en meta-beskrivning (max 160 tecken) som är lockande och innehåller huvudnyckelordet.',
};

export const tonalityMap: Record<string, string> = {
    'Professionell/Formell': 'Denna tonalitet ska vara saklig, objektiv och använder ofta ett mer avancerat ordförråd. undviker slang och förkortningar. för B2B-kommunikation, juridiska texter, vetenskapliga rapporter och officiella meddelanden.',
    'Vänlig/Tillgänglig': 'Skriv inbjudande och lättsam tonalitet som använder ett vardagligt språk och ofta tilltalar läsaren direkt. skapa en känsla av samhörighet.',
    'Informativ/Faktapresenterande': 'använd en tonalitet som Fokuserar på att presentera fakta och data på ett tydligt och koncist sätt. Syftet är att utbilda eller upplysa läsaren, utan att vara för säljig eller personlig.',
    'Övertygande/Säljande': 'Använd en tonalitet som engagera läsaren känslomässigt och intellektuellt för att motivera dem till en specifik handling (köp, anmälan etc.). Använder ofta starka verb, fördelar snarare än funktioner och call-to-actions.',
};

export const avoidWordsMap: Record<string, string> = {
    upptäck: '"Upptäck"',
    utforska: '"Utforska"',
    oumbärligt: '"Oumbärligt"',
    särskiljt: '"Särskiljt"',
    idealiskt: '"idealiskt"',
    'central-del-av': '"central del av"',
};

    