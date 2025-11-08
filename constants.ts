
import type { VocabularyItem, ChatMessage, StickyNoteData } from './types';

export const DEFAULT_SESSION_FRAGMENT_COUNT = 3;

export const userProvidedText = `
In the heart of the sprawling city of Eldoria, where magic and machinery coexisted in a delicate, often chaotic, balance, lived a young inventor named Elara. Her workshop was a testament to her genius and her eccentricity—a cluttered space filled with half-finished automatons, blueprints for flying machines sketched on napkins, and jars containing captured starlight. Elara wasn't just any inventor; she was a student of the forgotten arts, blending ancient runic magic with cutting-edge clockwork technology.

One evening, while tinkering with a device designed to translate the whispers of the wind, she intercepted a fragmented message. It spoke of the Sunstone, a legendary artifact said to hold the power of a star, hidden deep within the Crystal Mountains. The message was a cry for help from a neighboring kingdom, whose lands were slowly being consumed by a creeping, unnatural winter. The Sunstone, the message claimed, was their only hope.

Driven by a sense of adventure she inherited from her explorer grandmother, Elara knew she had to act. She packed her satchel with enchanted tools, a self-heating blanket, and enough food for a week. Her most trusted companion, a small clockwork bird named Gizmo, perched on her shoulder, its metallic feathers whirring softly. Gizmo was more than a pet; its crystal eyes could see magical auras, and its tiny gears could decipher complex codes.

Their journey began at the city's edge, leaving the familiar hum of Eldoria for the untamed wilderness. The path to the Crystal Mountains was treacherous, winding through whispering forests where the trees were said to remember the dawn of time, and across roaring rivers that carved canyons through the land. Elara used her inventions to navigate the challenges. A pair of boots fitted with miniature gyroscopes allowed her to walk across the most unstable terrain, while a compass attuned to the planet's magical ley lines always pointed them in the right direction.

During their travels, they encountered a stoic mountain guardian named Kael, a man whose lineage had protected the paths to the mountains for centuries. He was skeptical of outsiders, but upon seeing the sincerity in Elara's eyes and the urgency of her quest, he agreed to guide them. Kael spoke of the trials that protected the Sunstone—riddles posed by ancient spirits and illusions designed to mislead the unworthy.

Together, the trio faced the trials. Elara's sharp mind, Kael's deep knowledge of the mountains, and Gizmo's unique senses proved to be a formidable combination. They solved the spirit's riddle, navigated the labyrinth of shifting mirrors, and finally arrived at a vast cavern, its ceiling glittering with giant crystals. In the center, resting on a pedestal of pure obsidian, was the Sunstone. It pulsed with a warm, gentle light, bathing the entire cavern in a golden glow, a beacon of hope against the encroaching cold.
`;

export const mockCorrectTranslations: string[] = [
  "En el corazón de la extensa ciudad de Eldoria, donde la magia y la maquinaria coexistían en un delicado, a menudo caótico, equilibrio, vivía una joven inventora llamada Elara.",
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
  { original: "ancient", translation: "antiguo", context: "The ancient castle stood...", addedFrom: "Fragment 1" },
  { original: "weathered", translation: "resistido", context: "walls had weathered storms...", addedFrom: "Fragment 2" },
  { original: "tapestries", translation: "tapices", context: "tapestries told stories...", addedFrom: "AI Assistant" }
];

export const mockChatHistory: ChatMessage[] = [
  { sender: "user", text: "What does 'weathered' mean in this context?" },
  { sender: "ai", text: "In this context, 'weathered' means to have endured or survived difficult conditions over time. The stone walls have withstood many storms throughout the centuries." },
  { sender: "user", text: "How do I translate 'countless'?" },
  // FIX: Corrected syntax error in the sender property. It was `sender:ai"` instead of `sender: "ai"`.
  { sender: "ai", text: "'Countless' means 'innumerables' or 'incontables' in Spanish. It indicates a very large number that cannot be easily counted." }
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
