
import type { VocabularyItem, ChatMessage, StickyNoteData } from './types';

export const DEFAULT_SESSION_FRAGMENT_COUNT = 3;

export const userProvidedText = `
In the brownstone on West Thirty-fifth Street, Inspector Marcus Blackwood sat behind his mahogany desk, methodically examining the evidence from the Pemberton case. His assistant, Detective Sarah Chen, entered the study carrying a silver tray with afternoon tea and a collection of witness statements. Blackwood was not just any inspector; he was a master of deductive reasoning, combining classical investigative techniques with modern forensic analysis.

That morning, while reviewing files from unsolved cases, he had received an urgent telephone call. It concerned the Crimson Diamond, a priceless ruby said to possess an unusual history, stolen from the Metropolitan Museum during a charity gala. The caller was a representative from the insurance company, whose client faced financial ruin if the gem remained missing. The Crimson Diamond, according to the caller, was their only hope for recovery.

Driven by his reputation for solving impossible cases, Blackwood knew he had to investigate. He instructed Chen to gather the necessary equipment: fingerprint powder, magnifying glasses, and detailed floor plans of the museum. His most reliable informant, a small-time art dealer named Vincent, had already provided crucial intelligence about suspicious activities in the art underworld. Vincent was more than a contact; his connections reached deep into the criminal networks, and his sharp eye could spot forgeries that fooled even experts.

Their investigation began at the museum's main entrance, leaving the familiar comfort of the brownstone for the bustling cultural district. The path to solving the case was complex, winding through interviews with wealthy patrons who attended the gala, and examining security footage that captured shadows moving through dimly lit corridors. Blackwood used his analytical methods to piece together the timeline. A set of lockpicks found near the display case allowed him to understand the thief's approach, while a notebook containing detailed museum layouts always pointed them toward the most likely escape routes.

During their inquiries, they encountered a mysterious art collector named Helena Voss, a woman whose private collection had grown substantially over recent years. She was suspicious of investigators, but upon recognizing Blackwood's reputation and the urgency of the case, she agreed to cooperate. Helena spoke of the security measures protecting valuable artifacts—sophisticated alarms installed by master craftsmen and decoy pieces designed to mislead amateur thieves.

Together, the team pursued every lead. Blackwood's methodical approach, Chen's technical expertise, and Vincent's street knowledge proved to be an effective combination. They analyzed the security footage, traced the lockpicks to their manufacturer, and finally discovered a hidden passage behind the museum's main gallery. In a secret room, concealed behind a false wall, was the Crimson Diamond. It gleamed with deep red fire, casting reflections across the hidden chamber, a testament to both the thief's cunning and the investigators' persistence.
`;

export const mockCorrectTranslations: string[] = [
  "En la casa de piedra rojiza de la calle Treinta y cinco Oeste, el Inspector Marcus Blackwood se sentó detrás de su escritorio de caoba, examinando metódicamente la evidencia del caso Pemberton.",
  "Su taller era un testimonio de su genio y su excentricidad: un espacio desordenado lleno de autómatas a medio terminar, planos de máquinas voladoras esbozados en servilletas y frascos que contenían luz estelar capturada.",
  "Elara no era una inventora cualquiera; era una estudiante de las artes olvidadas, que mezclaba la antigua magia rúnica con la tecnología de relojería de vanguardia.",
  "Una tarde, mientras jugueteaba con un dispositivo diseñado para traducir los susurros del viento, interceptó un mensaje fragmentado.",
  "Hablaba de la Piedra del Sol, un artefacto legendario que se decía que contenía el poder de una estrella, escondido en las profundidades de las Montañas de Cristal.",
  "El mensaje era una petición de auxilio de un reino vecino, cuyas tierras estaban siendo consumidas lentamente por un invierno rastrero y antinatural.",
  "La Piedra del Sol, afirmaba el mensaje, era su única esperanza.",
  "Impulsada por un sentido de la aventura que heredó de su abuela exploradora, Elara supo que tenía que actuar.",
  "Empacó su bolso con herramientas encantadas, una manta autocalentable y comida suficiente para una semana.",
  "Su compañero más confiable, un pequeño pájaro de relojería llamado Gizmo, se posó en su hombro, sus plumas metálicas zumbando suavemente.",
  "Gizmo era más que una mascota; sus ojos de cristal podían ver auras mágicas y sus diminutos engranajes podían descifrar códigos complejos.",
  "Su viaje comenzó en el borde de la ciudad, dejando el zumbido familiar de Eldoria por la naturaleza indómita.",
  "El camino hacia las Montañas de Cristal era traicionero, serpenteando a través de bosques susurrantes donde se decía que los árboles recordaban el amanecer de los tiempos, y a través de ríos rugientes que tallaban cañones en la tierra.",
  "Elara usó sus inventos para sortear los desafíos.",
  "Un par de botas equipadas con giroscopios en miniatura le permitieron caminar por el terreno más inestable, mientras que una brújula sintonizada con las líneas ley mágicas del planeta siempre los apuntaba en la dirección correcta.",
  "Durante sus viajes, encontraron a un estoico guardián de la montaña llamado Kael, un hombre cuyo linaje había protegido los caminos hacia las montañas durante siglos.",
  "Se mostraba escéptico con los forasteros, pero al ver la sinceridad en los ojos de Elara y la urgencia de su búsqueda, accedió a guiarlos.",
  "Kael habló de las pruebas que protegían la Piedra del Sol: acertijos planteados por espíritus antiguos e ilusiones diseñadas para engañar a los indignos.",
  "Juntos, el trío enfrentó las pruebas.",
  "La mente aguda de Elara, el profundo conocimiento de las montañas de Kael y los sentidos únicos de Gizmo demostraron ser una combinación formidable.",
  "Resolvieron el acertijo del espíritu, navegaron por el laberinto de espejos cambiantes y finalmente llegaron a una vasta caverna, con el techo reluciente de cristales gigantes.",
  "En el centro, descansando sobre un pedestal de pura obsidiana, estaba la Piedra del Sol.",
  "Pulsaba con una luz cálida y suave, bañando toda la caverna en un brillo dorado, un faro de esperanza contra el frío que se acercaba."
];


export const mockVocabulary: VocabularyItem[] = [
  { original: "methodically", translation: "metódicamente", context: "examining the evidence methodically...", addedFrom: "Fragment 1" },
  { original: "deductive", translation: "deductivo", context: "master of deductive reasoning...", addedFrom: "Fragment 2" },
  { original: "forensic", translation: "forense", context: "modern forensic analysis...", addedFrom: "AI Assistant" }
];

export const mockChatHistory: ChatMessage[] = [
  { sender: "user", text: "What does 'methodically' mean in this context?" },
  { sender: "ai", text: "In this context, 'methodically' means to do something in a systematic, organized way following a logical order. The inspector examines evidence step by step with careful attention to detail." },
  { sender: "user", text: "How do I translate 'brownstone'?" },
  { sender: "ai", text: "'Brownstone' means 'casa de piedra rojiza' in Spanish. It refers to a type of building made from brown sandstone, common in New York City." }
];

export const initialStickyNotes: StickyNoteData[] = [
  {
    id: 1,
    title: "Grammar Tip",
    content: "Remember to match adjective gender and number with the noun!",
    position: { x: -80, y: 280 },
    size: { width: 48, height: 48 },
    zIndex: 200,
    minimized: true,
  },
  {
    id: 2,
    title: "Useful Phrase",
    content: "'Poco a poco' - Little by little. A great phrase for learning.",
    position: { x: -80, y: 340 },
    size: { width: 48, height: 48 },
    zIndex: 201,
    minimized: true,
  }
];
