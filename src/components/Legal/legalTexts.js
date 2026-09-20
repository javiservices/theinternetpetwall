/**
 * Textos legales profesionales y completos adaptados a la legislación española y europea
 * (RGPD, LOPDGDD, LSSI-CE, TRLGDCU y normativas europeas equivalentes).
 * Totalmente traducidos para Español, English, Français y Deutsch.
 */

const SPANISH_LEGAL = {
  privacy: {
    id: "privacy",
    badge: "RGPD & LOPDGDD",
    title: "Política de Privacidad y Protección de Datos",
    subtitle: "Información clara y transparente sobre cómo cuidamos de tus datos y los de tu mascota",
    lastUpdated: "Septiembre 2026",
    sections: [
      {
        heading: "1. Responsable del Tratamiento",
        content: `El responsable del tratamiento de los datos recabados en este sitio web es **The Internet Pet Wall** (en adelante, "La Plataforma"), con domicilio de contacto electrónico en **privacy@theinternetpetwall.com**.

La Plataforma está concebida como un mural digital conmemorativo de acceso público dedicado a rendir homenaje y dar visibilidad a mascotas y animales de compañía de todo el mundo.`,
      },
      {
        heading: "2. Datos Personales que Recopilamos",
        content: `Recopilamos únicamente los datos imprescindibles para la prestación del servicio conmemorativo y la emisión del pasaporte oficial:

- **Datos de la Mascota y su Tutor:** Nombre de la mascota, especie, raza, año o fecha de nacimiento, dedicatoria o frase conmemorativa, ciudad, provincia, país, fotografía de la mascota y, con carácter estrictamente voluntario, el nombre o alias del tutor y su cuenta pública de Instagram.
- **Datos de Pago y Facturación:** Los cobros se gestionan de forma cifrada e íntegra a través de **Stripe Payments Europe, Ltd.** mediante protocolo bancario seguro TLS 1.3 y certificación PCI-DSS Nivel 1. La Plataforma **nunca almacena, visualiza ni tiene acceso** a números de tarjetas de crédito o débito ni códigos de verificación (CVC/CVV).
- **Datos Técnicos de Seguridad y Conexión (Logs):** Al interactuar con la plataforma (por ejemplo, al dar chuches a una mascota), se registra temporalmente en los servidores una huella técnica que incluye la dirección IP del dispositivo con la finalidad exclusiva de **seguridad informática, mitigación de ataques automatizados y control de ritmo (rate-limiting)**.`,
      },
      {
        heading: "3. Finalidad del Tratamiento de los Datos",
        content: `Tratamos los datos recopilados para las siguientes finalidades:
        
1. **Inmortalización y Exhibición:** Publicar de forma permanente la ficha de la mascota en el Gran Muro de Mascotas y en el podio de honor.
2. **Emisión de Documentos Oficiales:** Generar y poner a disposición del usuario el Pasaporte Oficial Digital en alta resolución (PNG) con su código de registro único internacional y su chapa/etiqueta digital con código QR.
3. **Seguridad y Control de Spam:** Gestionar el temporizador de enfriamiento (*cooldown*) de 5 minutos al enviar chuches o reconocimientos, evitando la saturación del servicio mediante bots.
4. **Atención a Usuarios:** Tramitar dudas, modificaciones o solicitudes de baja de fichas solicitadas por los tutores.`,
      },
      {
        heading: "4. Base Jurídica del Tratamiento",
        content: `El tratamiento de tus datos se fundamenta en las siguientes bases del Reglamento General de Protección de Datos (RGPD):

- **Ejecución de un Contrato / Servicio (Art. 6.1.b RGPD):** Necesario para tramitar la inscripción, generar el pasaporte digital y publicar el pixel conmemorativo en el muro.
- **Consentimiento del Interesado (Art. 6.1.a RGPD):** Otorgado expresamente al subir la fotografía de la mascota y rellenar el formulario de registro voluntario.
- **Interés Legítimo (Art. 6.1.f RGPD y Considerando 49 RGPD):** Aplicable al tratamiento de logs técnicos y direcciones IP para garantizar la seguridad de la red y de la información, previniendo abusos y ataques DDoS.`,
      },
      {
        heading: "5. Destinatarios y Proveedores de Servicios",
        content: `Tus datos no serán vendidos, cedidos ni compartidos con terceros con fines comerciales o publicitarios. Únicamente acceden a ellos proveedores tecnológicos necesarios para el funcionamiento de la web:

- **Stripe Payments Europe, Ltd. (Irlanda / UE):** Pasarela de pagos segura y prevención de fraude.
- **Supabase Inc. (Infraestructura Cloud):** Almacenamiento seguro de base de datos y Content Delivery Network (CDN) para servir las fotografías de forma ultrarrápida, bajo estrictos acuerdos de procesamiento de datos y cifrado en reposo y en tránsito.`,
      },
      {
        heading: "6. Plazo de Conservación",
        content: `- **Fichas del Muro:** Dada la naturaleza del servicio conmemorativo de "inmortalización", los datos de la mascota permanecerán expuestos de manera indefinida mientras la plataforma esté activa, a menos que el tutor solicite su retirada o borrado.
- **Logs Técnicos de Chuches:** Se almacenan temporalmente durante el tiempo estrictamente necesario para controlar el límite de frecuencia y se depuran de forma periódica.`,
      },
      {
        heading: "7. Ejercicio de Derechos (ARSOPOL)",
        content: `Conforme a la normativa vigente, tienes derecho en cualquier momento a:
        
- Solicitar el **acceso** a tus datos y conocer qué información conservamos.
- Solicitar la **rectificación** de datos inexactos (por ejemplo, corregir la ciudad o el nombre de tu mascota).
- Solicitar la **supresión** ("derecho al olvido") y la eliminación permanente de la ficha y fotografía de tu mascota del Gran Muro.
- Solicitar la **limitación u oposición** a su tratamiento o la **portabilidad** de los mismos.

Para ejercer cualquiera de estos derechos, basta con enviar un correo electrónico a **privacy@theinternetpetwall.com** indicando el código oficial de registro de la mascota (por ejemplo, *PET-0014-ES*). Asimismo, puedes presentar una reclamación ante la **Agencia Española de Protección de Datos (AEPD)** en www.aepd.es si consideras que tus derechos han sido vulnerados.`,
      },
    ],
  },

  terms: {
    id: "terms",
    badge: "TRLGDCU & Comercio Electrónico",
    title: "Términos y Condiciones de Compra y Contratación",
    subtitle: "Condiciones que regulan la inmortalización de mascotas, emisión de pasaportes y uso de la plataforma",
    lastUpdated: "Septiembre 2026",
    sections: [
      {
        heading: "1. Objeto del Servicio",
        content: `Las presentes Condiciones Generales de Contratación regulan la adquisición del servicio digital de homenaje e inmortalización de mascotas en **The Internet Pet Wall** (YourPixel).
        
El servicio incluye:
- La asignación de un espacio conmemorativo perpetuo en el mural digital interactivo.
- La asignación de un código oficial único e irrepetible en formato internacional (ej. *PET-0001-ES*).
- La generación instantánea de un Pasaporte Oficial Digital de Registro en formato de alta resolución (PNG), descargable e imprimible.
- La emisión de una Placa / Collar Tag Digital con código QR de acceso directo al perfil de la mascota.
- La activación del sistema comunitario de entrega de chuches y reconocimientos de afecto.`,
      },
      {
        heading: "2. Modalidades y Precios",
        content: `Los precios vigentes para las diferentes modalidades de inscripción son:

- **Inscripción Estándar: 1,00 € (pago único)**. Incluye registro de por vida, ficha oficial en el muro, placa básica y pasaporte oficial digital.
- **Inscripción VIP Gold: 2,00 € (pago único)**. Incluye todo lo anterior con marco dorado iridiscente en el mural, corona distintiva VIP, prioridad de indexación en filtros y mayor visibilidad en el podio.

Todos los precios mostrados en la plataforma incluyen el Impuesto sobre el Valor Añadido (IVA) legalmente aplicable en España y la Unión Europea. No existen suscripciones recurrentes ni costes ocultos de renovación.`,
      },
      {
        heading: "3. Causa Solidaria: 1 Inscripción = 1 Huella de Ayuda",
        content: `El **20% del importe neto de cada inscripción** se dona de forma periódica a protectoras de animales, refugios sin ánimo de lucro y casas de acogida legalmente constituidas, con el fin de adquirir alimento, costear tratamientos veterinarios y mejorar la calidad de vida de animales abandonados o en situación de vulnerabilidad.`,
      },
      {
        heading: "4. Proceso de Pago y Seguridad",
        content: `Los pagos se procesan de forma instantánea a través de la pasarela bancaria oficial de **Stripe**. Se admiten tarjetas de crédito y débito (Visa, Mastercard, American Express), Apple Pay y Google Pay. La transacción se realiza bajo cifrado de alta seguridad de extremo a extremo conforme a la directiva europea PSD2 (autenticación reforzada SCA).`,
      },
      {
        heading: "5. Excepción al Derecho de Desistimiento (Contenido Digital Personalizado)",
        content: `En cumplimiento del **artículo 103, apartado m) del Real Decreto Legislativo 1/2007, de 16 de noviembre (Ley General para la Defensa de los Consumidores y Usuarios - TRLGDCU)**:

> *"El derecho de desistimiento no será aplicable a los contratos que se refieran al suministro de contenido digital que no se preste en un soporte material cuando la ejecución haya comenzado con el previo consentimiento expreso del consumidor y usuario con el conocimiento por su parte de que en consecuencia pierde su derecho de desistimiento."*

Al completar el pago, el usuario solicita y consiente expresamente la ejecución inmediata del servicio, consistente en la asignación del código oficial, la publicación irreversible del pixel en el muro y la generación en tiempo real de los documentos conmemorativos personalizados. En consecuencia, **no procede la devolución ni el derecho de desistimiento una vez prestado el servicio**.`,
      },
      {
        heading: "6. Normas de Moderación y Contenido Aceptable",
        content: `- El usuario garantiza que la fotografía aportada pertenece a una mascota o animal doméstico real y que ostenta los derechos de uso sobre la misma.
- **Contenido prohibido:** Queda estrictamente vetada la publicación de imágenes de personas sin su consentimiento, imágenes ofensivas, denigrantes, de maltrato animal, violentas, de carácter pornográfico, con marcas registradas ajenas o ilícitas.
- La Plataforma se reserva el derecho de eliminar o desactivar de inmediato cualquier ficha que vulnere estas reglas, sin que ello genere derecho a reembolso ni indemnización alguna.`,
      },
      {
        heading: "7. Disponibilidad y Garantía del Muro",
        content: `The Internet Pet Wall asume el compromiso de mantener la máxima disponibilidad y permanencia del mural mediante servidores cloud de alta fiabilidad y copias de seguridad continuas. No obstante, no responderá de caídas temporales atribuibles a incidencias generales de la red o paradas técnicas programadas para tareas de mantenimiento y optimización.`,
      },
      {
        heading: "8. Legislación y Jurisdicción Aplicable",
        content: `Estas condiciones se rigen por la legislación española. Para la resolución de cualquier controversia relativa a la interpretación o ejecución de este contrato, serán competentes los Juzgados y Tribunales del domicilio del consumidor. Asimismo, conforme al Reglamento (UE) 524/2013, la Comisión Europea facilita una plataforma de resolución de litigios en línea disponible en: https://ec.europa.eu/consumers/odr.`,
      },
    ],
  },

  cookies: {
    id: "cookies",
    badge: "LSSI-CE Art. 22.2 & ePrivacy",
    title: "Política de Cookies y Almacenamiento Local",
    subtitle: "Transparencia total: Qué tecnologías técnicas usamos en tu navegador y para qué sirven",
    lastUpdated: "Septiembre 2026",
    sections: [
      {
        heading: "1. ¿Qué son las cookies y el almacenamiento local (localStorage)?",
        content: `Una cookie o dispositivo de almacenamiento local (*localStorage*) es un pequeño fragmento de información que un sitio web guarda en el navegador de tu ordenador o teléfono móvil para recordar tus preferencias y garantizar el funcionamiento seguro y fluido de la aplicación.`,
      },
      {
        heading: "2. Nuestra Filosofía: Cero Rastreo Invasivo",
        content: `En **The Internet Pet Wall respetamos tu privacidad al 100%**:
        
- **NO utilizamos cookies de rastreo publicitario de terceros**.
- **NO creamos perfiles comerciales de tu comportamiento**.
- **NO vendemos tus datos a anunciantes ni redes de marketing**.

Únicamente empleamos mecanismos de almacenamiento **estrictamente técnicos y funcionales**, imprescindibles para el funcionamiento de la web o solicitados expresamente por ti al navegar.`,
      },
      {
        heading: "3. Tabla Detallada de Almacenamiento Local (localStorage)",
        content: `A continuación te detallamos con absoluta claridad cada uno de los elementos que esta aplicación guarda en tu dispositivo:

- **\`pet_wall_treat_cooldowns_v1\`** (Técnico / Anti-Spam): Duración de 300 segundos (5 minutos) por mascota. Guarda la hora de expiración para desactivar el botón de chuche y activar la cuenta atrás, protegiendo el servidor de saturaciones o envíos automáticos masivos.
- **\`pet_wall_lang\`** (Preferencia): Duración persistente. Recuerda el idioma seleccionado (Español, Inglés, Francés o Alemán).
- **\`pet_wall_theme\`** (Preferencia): Duración persistente. Recuerda tu elección de modo oscuro o claro.
- **\`pet_wall_my_ids\`** (Técnico / Funcional): Duración persistente. Guarda en tu propio dispositivo los identificadores de tus mascotas favoritas o registradas, permitiéndote encontrarlas fácilmente sin necesidad de obligarte a crear una cuenta con contraseña.
- **\`pending_pet_checkout\`** (sessionStorage): Duración temporal de sesión. Permite recuperar y presentarte el Pasaporte Oficial de tu mascota tan pronto como regresas del pago seguro en Stripe.`,
      },
      {
        heading: "4. Cookies de Terceros Estrictamente Necesarias",
        content: `- **Stripe Payments Europe, Ltd.:** Durante el proceso de pago seguro, Stripe establece cookies técnicas antifraude (tales como \`__stripe_mid\` o \`__stripe_sid\`) necesarias para cumplir con los estándares internacionales de seguridad bancaria y prevención de fraude con tarjetas de crédito.`,
      },
      {
        heading: "5. Exención del Consentimiento Previo",
        content: `De conformidad con el **artículo 22.2 de la Ley 34/2002 (LSSI-CE)** y las directrices de la **Agencia Española de Protección de Datos (AEPD)**, el almacenamiento de datos estrictamente necesarios para la prestación de un servicio solicitado expresamente por el usuario (como recordar el idioma o evitar ataques de spam en las chuches) **está exento de la obligación de recabar un consentimiento previo mediante banners intrusivos**. Sin embargo, facilitamos un banner transparente y selector para tu total tranquilidad.`,
      },
      {
        heading: "6. Cómo Gestionar o Borrar el Almacenamiento en tu Navegador",
        content: `Si lo deseas, puedes borrar o bloquear estos datos en cualquier momento accediendo a las opciones de configuración y privacidad de tu navegador (Chrome, Safari, Firefox, Edge). Ten en cuenta que si borras el almacenamiento local, se restablecerán tus preferencias de idioma, tema y mascotas guardadas.`,
      },
    ],
  },

  legal: {
    id: "legal",
    badge: "LSSI-CE Art. 10",
    title: "Aviso Legal e Información General",
    subtitle: "Información corporativa sobre la titularidad y condiciones de acceso al sitio web",
    lastUpdated: "Septiembre 2026",
    sections: [
      {
        heading: "1. Datos Identificativos del Titular",
        content: `En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos del titular del sitio web:

- **Denominación del Proyecto:** The Internet Pet Wall
- **Actividad:** Portal web conmemorativo y de homenaje digital para mascotas, emisión de pasaportes conmemorativos digitales y placas oficiales con código QR.
- **Contacto Electrónico:** contact@theinternetpetwall.com / legal@theinternetpetwall.com
- **Sitio Web Oficial:** https://theinternetpetwall.com`,
      },
      {
        heading: "2. Propiedad Intelectual e Industrial",
        content: `Todos los derechos de propiedad intelectual e industrial del sitio web, incluyendo el código fuente, diseño gráfico, logotipos, arquitectura de software, animaciones, bases de datos y textos son titularidad de The Internet Pet Wall o se dispone de las correspondientes licencias de uso.

Las fotografías subidas por los usuarios son de su respectiva autoría y propiedad. Al subirlas a la plataforma, el usuario concede a The Internet Pet Wall una licencia no exclusiva, de ámbito mundial y libre de regalías para su exhibición, reproducción y transformación técnica exclusivamente dentro del mural, carné oficial y materiales descargables asociados.`,
      },
      {
        heading: "3. Condiciones de Uso y Responsabilidad",
        content: `El usuario se compromete a hacer un uso lícito y adecuado de la plataforma, absteniéndose de introducir virus, scripts de sobrecarga, contenidos ilícitos o datos falsos.

The Internet Pet Wall no se responsabiliza de los comentarios o enlaces externos introducidos voluntariamente por los usuarios (por ejemplo, enlaces a perfiles de Instagram de los tutores).`,
      },
    ],
  },
};

const ENGLISH_LEGAL = {
  privacy: {
    id: "privacy",
    badge: "GDPR & Data Protection",
    title: "Privacy & Data Protection Policy",
    subtitle: "Clear, transparent information on how we safeguard your data and your pet's memory",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "1. Data Controller",
        content: `The data controller for information collected on this website is **The Internet Pet Wall** (hereinafter, "The Platform"), reachable at **privacy@theinternetpetwall.com**.

The Platform is designed as a public, commemorative digital mosaic dedicated to honoring and celebrating pets and companion animals worldwide.`,
      },
      {
        heading: "2. Personal Data We Collect",
        content: `We collect only the essential data required to provide the memorial service and issue the official passport:

- **Pet & Guardian Data:** Pet's name, species, breed, birth date or year, memorial dedication, city, state/province, country, pet photograph, and optionally the guardian's name and public Instagram handle.
- **Payment & Billing Data:** Payments are processed end-to-end via **Stripe Payments Europe, Ltd.** using TLS 1.3 banking protocols and PCI-DSS Level 1 certification. The Platform **never stores, views, or accesses** credit or debit card numbers or security codes (CVC/CVV).
- **Technical Security & Connection Logs:** When interacting with the website (such as giving treats), a temporary technical log containing the device IP address is recorded exclusively for **cybersecurity, bot mitigation, and rate-limiting enforcement**.`,
      },
      {
        heading: "3. Purposes of Data Processing",
        content: `We process data for the following legitimate purposes:

1. **Immortalization & Showcase:** Permanently displaying your pet's memorial profile on the Great Pet Wall and the podium of honor.
2. **Official Document Issuance:** Generating and providing the high-resolution Digital Official Passport (PNG) with international registration code and QR collar tag.
3. **Security & Anti-Spam Control:** Managing the 5-minute cooldown timer for sending treats to prevent server flooding and automated abuse.
4. **User Support:** Assisting with inquiries, corrections, or profile deletion requests submitted by pet owners.`,
      },
      {
        heading: "4. Legal Basis for Processing",
        content: `Our data processing activities are based on the General Data Protection Regulation (GDPR):

- **Contract Performance (Art. 6.1.b GDPR):** Necessary to fulfill the memorial registration, issue digital certificates, and publish the commemorative pixel.
- **Consent (Art. 6.1.a GDPR):** Explicitly provided when uploading the pet photograph and filling out the voluntary registration form.
- **Legitimate Interest (Art. 6.1.f GDPR):** Applicable to technical security logs and IP rate-limiting to protect network and information security against attacks and abuse.`,
      },
      {
        heading: "5. Service Providers & Data Transfers",
        content: `Your data is never sold, leased, or shared with third parties for commercial or advertising purposes. Only essential infrastructure providers access it:

- **Stripe Payments Europe, Ltd. (Ireland / EU):** Secure payment processing and fraud detection.
- **Supabase Inc. (Cloud Infrastructure):** Secure database hosting and global Content Delivery Network (CDN) for fast image delivery, under strict data processing agreements.`,
      },
      {
        heading: "6. Data Retention Periods",
        content: `- **Wall Memorial Profiles:** Due to the perpetual nature of the commemorative service, pet records remain published indefinitely while the platform is live, unless deletion is requested by the guardian.
- **Technical Treat Logs:** Temporarily stored only for the duration required to enforce the cooldown limit, then automatically pruned.`,
      },
      {
        heading: "7. Your Rights under GDPR",
        content: `Under EU and international data protection laws, you hold the right to:

- Request **access** to your data and know what information is stored.
- Request **rectification** of inaccurate records (e.g., updating a pet's city or name).
- Request **erasure** ("right to be forgotten") and the permanent removal of your pet's card and photo.
- Request **restriction or objection** to processing, and data portability.

To exercise any of these rights, contact us at **privacy@theinternetpetwall.com** referencing your pet's official registration code (e.g., *PET-0014-ES*). You may also lodge a complaint with your competent supervisory authority.`,
      },
    ],
  },

  terms: {
    id: "terms",
    badge: "Consumer Contracts & E-Commerce",
    title: "Terms and Conditions of Purchase & Service",
    subtitle: "Terms governing pet immortalization, official passport issuance, and platform usage",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "1. Service Scope",
        content: `These General Terms and Conditions govern the acquisition of the pet digital memorial and immortalization service on **The Internet Pet Wall** (YourPixel).

The service comprises:
- Allocation of a perpetual memorial space on the interactive digital mosaic.
- Allocation of an exclusive international registration code (e.g., *PET-0001-ES*).
- Instant generation of an official high-resolution Digital Registration Passport (PNG), downloadable and printable.
- Issuance of a digital QR Collar Tag linking directly to the pet's live profile.
- Enabling the community treat-sending and appreciation system.`,
      },
      {
        heading: "2. Tiers and Pricing",
        content: `Current pricing for registration tiers:

- **Standard Registration: €1.00 (one-time payment)**. Includes lifetime registration, official wall card, basic tag, and digital official passport.
- **VIP Gold Registration: €2.00 (one-time payment)**. Includes all Standard features plus an iridescent gold border, VIP crown badge, filter priority, and featured podium visibility.

All displayed prices include applicable Value Added Tax (VAT) in the European Union. There are no recurring subscriptions or hidden maintenance fees.`,
      },
      {
        heading: "3. Charitable Cause: 1 Registration = 1 Helping Paw",
        content: `**20% of net proceeds from every registration** is regularly donated to officially registered animal shelters, non-profit rescue organizations, and foster homes to supply food, cover veterinary care, and improve the lives of abandoned animals.`,
      },
      {
        heading: "4. Payment & Security",
        content: `Payments are processed immediately via the certified banking gateway of **Stripe**. We accept major credit/debit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay. Transactions are secured with end-to-end encryption under European PSD2 standards (Strong Customer Authentication - SCA).`,
      },
      {
        heading: "5. Exception to Right of Withdrawal (Custom Digital Content)",
        content: `Pursuant to **Article 16(m) of the European Consumer Rights Directive (Directive 2011/83/EU)**:

> *"The right of withdrawal does not apply to contracts for the supply of digital content which is not supplied on a tangible medium if the performance has begun with the consumer’s prior express consent and acknowledgment that they thereby lose their right of withdrawal."*

Upon completing payment, the user expressly requests and consents to immediate service fulfillment: generating the international code, irreversibly publishing the pet pixel on the wall, and rendering the custom high-resolution certificate. Consequently, **no refund or withdrawal applies once the digital assets are generated**.`,
      },
      {
        heading: "6. Content Moderation & Acceptable Use",
        content: `- The user warrants that uploaded photos belong to a real companion animal and that they own or hold proper usage rights.
- **Prohibited content:** Images of persons without consent, offensive, defamatory, violent, animal-cruelty, pornographic, or copyrighted imagery are strictly forbidden.
- The Platform reserves the right to immediately remove or disable any entry that violates these standards without entitlement to refund.`,
      },
      {
        heading: "7. Availability and Guarantees",
        content: `The Internet Pet Wall commits to maintaining high availability and permanence of the mosaic via resilient cloud servers and automated backups. However, temporary downtimes due to global network disruptions or scheduled maintenance may occasionally occur.`,
      },
      {
        heading: "8. Applicable Law and Dispute Resolution",
        content: `These terms are governed by applicable law. For consumer disputes, the competent courts will be those of the consumer's domicile. In accordance with EU Regulation 524/2013, the European Commission provides an online dispute resolution platform at: https://ec.europa.eu/consumers/odr.`,
      },
    ],
  },

  cookies: {
    id: "cookies",
    badge: "ePrivacy & Technical Storage",
    title: "Cookie and Local Storage Policy",
    subtitle: "Complete transparency: What technical technologies we use in your browser and why",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "1. What are cookies and local storage (localStorage)?",
        content: `A cookie or local storage item (*localStorage*) is a small piece of data saved by a website in your browser to remember your settings and guarantee smooth, secure browsing.`,
      },
      {
        heading: "2. Our Philosophy: Zero Invasive Tracking",
        content: `At **The Internet Pet Wall, we respect your privacy completely**:

- **We DO NOT use third-party advertising tracking cookies**.
- **We DO NOT build commercial behavioral profiles**.
- **We DO NOT sell your data to advertisers or marketing networks**.

We solely employ **strictly technical and functional** storage mechanisms essential for operating the website or explicitly requested by you.`,
      },
      {
        heading: "3. Detailed Local Storage (localStorage) Inventory",
        content: `Here is a clear breakdown of every key stored on your device:

- **\`pet_wall_treat_cooldowns_v1\`** (Technical / Anti-Spam): 300 seconds (5 minutes) per pet. Stores expiration timestamps to disable the treat button and run the countdown timer, shielding servers from automated abuse.
- **\`pet_wall_lang\`** (Preference): Persistent. Remembers your selected language (Spanish, English, French, German).
- **\`pet_wall_theme\`** (Preference): Persistent. Remembers your dark or light mode preference.
- **\`pet_wall_my_ids\`** (Functional): Persistent. Stores identifiers of your registered or saved favorite pets directly on your device, avoiding the need for passwords.
- **\`pending_pet_checkout\`** (sessionStorage): Temporary session. Retrieves and presents your official pet passport immediately upon returning from secure Stripe checkout.`,
      },
      {
        heading: "4. Strictly Necessary Third-Party Cookies",
        content: `- **Stripe Payments Europe, Ltd.:** During secure checkout, Stripe deploys essential anti-fraud technical cookies (such as \`__stripe_mid\` or \`__stripe_sid\`) to fulfill international banking security and fraud-prevention mandates.`,
      },
      {
        heading: "5. Exemption from Prior Consent for Technical Storage",
        content: `Under EU ePrivacy rules and national implementations, storage strictly necessary to provide an explicitly requested service (such as language preferences or anti-spam treat cooldowns) **is exempt from mandatory consent banners**. However, we provide an interactive CMP banner and customizable toggles for your complete peace of mind.`,
      },
      {
        heading: "6. Managing or Clearing Browser Storage",
        content: `You may clear or block local storage at any time through your browser privacy settings (Chrome, Safari, Firefox, Edge). Note that clearing local storage will reset your language, theme, and saved pet favorites.`,
      },
    ],
  },

  legal: {
    id: "legal",
    badge: "Company & Legal Notice",
    title: "Legal Notice & Corporate Information",
    subtitle: "Corporate identification, ownership, and website access terms",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "1. Identification of the Owner",
        content: `In compliance with information society services regulations, notice is given regarding the platform owner:

- **Project Title:** The Internet Pet Wall
- **Activity:** Commemorative digital pet memorial portal, issuance of digital official passports and QR badges.
- **Electronic Contact:** contact@theinternetpetwall.com / legal@theinternetpetwall.com
- **Official Website:** https://theinternetpetwall.com`,
      },
      {
        heading: "2. Intellectual and Industrial Property",
        content: `All intellectual and industrial property rights of the website—including source code, graphic design, logos, software architecture, and content—belong to The Internet Pet Wall or are licensed.

User-uploaded photographs remain the property of their respective creators. By submitting them, the user grants The Internet Pet Wall a worldwide, royalty-free, non-exclusive license for their technical reproduction, optimization, and display within the mosaic and associated certificates.`,
      },
      {
        heading: "3. Terms of Use & Liability",
        content: `Users agree to use the platform lawfully and properly, refraining from uploading viruses, bot scripts, unlawful content, or deceptive details.

The Internet Pet Wall is not responsible for external links or third-party handles voluntarily provided by users (such as Instagram profiles).`,
      },
    ],
  },
};

const FRENCH_LEGAL = {
  privacy: {
    id: "privacy",
    badge: "RGPD & Données Personnelles",
    title: "Politique de Confidentialité et Protection des Données",
    subtitle: "Information claire et transparente sur la façon dont nous protégeons vos données et la mémoire de vos animaux",
    lastUpdated: "Septembre 2026",
    sections: [
      {
        heading: "1. Responsable du Traitement",
        content: `Le responsable du traitement des données collectées sur ce site est **The Internet Pet Wall** (ci-après, "La Plateforme"), joignable par courrier électronique à **privacy@theinternetpetwall.com**.

La Plateforme est conçue comme un mur commémoratif numérique public dédié à rendre hommage et donner de la visibilité aux animaux de compagnie du monde entier.`,
      },
      {
        heading: "2. Données Personnelles Collectées",
        content: `Nous collectons uniquement les données strictement nécessaires à la prestation du service commémoratif et à l'émission du passeport officiel :

- **Données de l'Animal et de son Tuteur :** Nom de l'animal, espèce, race, année ou date de naissance, dédicace, ville, région/pays, photographie de l'animal et, de manière facultative, le nom du tuteur et son compte Instagram public.
- **Données de Paiement :** Les transactions sont gérées de manière chiffrée par **Stripe Payments Europe, Ltd.** selon le protocole TLS 1.3 et la certification PCI-DSS Niveau 1. La Plateforme **ne stocke ni n'a accès** aux numéros de cartes bancaires ni aux cryptogrammes de sécurité (CVC/CVV).
- **Journaux Techniques de Sécurité (Logs) :** Lors de l'envoi de friandises, une trace technique temporaire comprenant l'adresse IP est enregistrée à des fins exclusives de **cybersécurité, prévention des attaques automatisées et limitation de débit (rate-limiting)**.`,
      },
      {
        heading: "3. Finalités du Traitement",
        content: `Nous traitons vos données pour les finalités suivantes :

1. **Immortalisation et Exposition :** Publier de façon permanente la fiche de l'animal sur le Grand Mur et sur le podium d'honneur.
2. **Émission de Documents Officiels :** Générer le Passeport Officiel Numérique en haute résolution (PNG) avec code d'enregistrement international et médaille QR.
3. **Sécurité et Anti-Spam :** Gérer le compte à rebours de 5 minutes lors de l'envoi de friandises pour prévenir la surcharge des serveurs.
4. **Assistance Utilisateurs :** Répondre aux demandes d'assistance, de modification ou de suppression formulées par les propriétaires.`,
      },
      {
        heading: "4. Base Juridique du Traitement",
        content: `Le traitement repose sur le Règlement Général sur la Protection des Données (RGPD) :

- **Exécution d'un Contrat / Service (Art. 6.1.b RGPD) :** Nécessaire pour traiter l'inscription, générer le passeport et publier le pixel.
- **Consentement (Art. 6.1.a RGPD) :** Donné expressément lors du téléchargement de la photo et du formulaire d'inscription.
- **Intérêt Légitime (Art. 6.1.f RGPD) :** Pour la sécurité des réseaux, la prévention des attaques DDoS et le contrôle anti-spam des friandises.`,
      },
      {
        heading: "5. Destinataires et Sous-Traitants",
        content: `Vos données ne sont ni vendues, ni louées, ni cédées à des fins publicitaires. Seuls nos prestataires techniques y accèdent pour les besoins du service :

- **Stripe Payments Europe, Ltd. (Irlande / UE) :** Paiements sécurisés et détection des fraudes.
- **Supabase Inc. (Infrastructure Cloud) :** Hébergement sécurisé de bases de données et réseau CDN pour la livraison rapide des photos.`,
      },
      {
        heading: "6. Durée de Conservation",
        content: `- **Profils du Mur :** En raison de la nature perpétuelle du mémorial, les fiches restent en ligne de manière indéfinie, sauf demande d'effacement du tuteur.
- **Logs Techniques de Friandises :** Conservés temporairement pour la durée nécessaire au respect du délai d'attente, puis automatiquement purgés.`,
      },
      {
        heading: "7. Vos Droits (RGPD)",
        content: `Conformément au RGPD, vous disposez des droits suivants :

- Droit d'**accès** à vos données et droit de **rectification**.
- Droit à l'**effacement** (« droit à l'oubli ») de la fiche et de la photo de votre animal.
- Droit à la **limitation ou opposition** au traitement et droit à la **portabilité**.

Pour exercer vos droits, écrivez à **privacy@theinternetpetwall.com** en précisant le code officiel de votre animal (*ex. PET-0014-ES*). Vous pouvez également vous adresser à la CNIL si vous estimez que vos droits ne sont pas respectés.`,
      },
    ],
  },

  terms: {
    id: "terms",
    badge: "Consommation & Commerce Électronique",
    title: "Conditions Générales de Vente et d'Utilisation",
    subtitle: "Conditions régissant l'immortalisation des animaux, l'émission de passeports et l'usage de la plateforme",
    lastUpdated: "Septembre 2026",
    sections: [
      {
        heading: "1. Objet du Service",
        content: `Les présentes Conditions Générales régissent la fourniture du service d'hommage et d'immortalisation numérique d'animaux sur **The Internet Pet Wall** (YourPixel).

Le service comprend :
- L'attribution d'un espace commémoratif perpétuel sur la mosaïque interactive.
- L'attribution d'un code officiel unique (ex. *PET-0001-ES*).
- La génération immédiate d'un Passeport Officiel Numérique en haute définition (PNG), téléchargeable et imprimable.
- L'émission d'une Médaille / QR Tag numérique pointant vers le profil de l'animal.
- L'activation du système communautaire d'envoi de friandises.`,
      },
      {
        heading: "2. Tarifs et Modalités",
        content: `Les tarifs applicables sont les suivants :

- **Inscription Standard : 1,00 € (paiement unique)**. Inscription à vie, fiche sur le mur, médaille de base et passeport officiel numérique.
- **Inscription VIP Gold : 2,00 € (paiement unique)**. Comprend tous les avantages Standard avec cadre doré iridescent, couronne VIP, priorité dans les filtres et visibilité accrue sur le podium.

Tous les prix incluent la TVA applicable. Aucun abonnement ni frais de renouvellement caché.`,
      },
      {
        heading: "3. Cause Solidaire : 1 Inscription = 1 Patte Tendue",
        content: `**20 % du montant net de chaque inscription** est reversé périodiquement à des refuges et associations de protection animale légalement reconnus, afin de financer la nourriture et les soins vétérinaires d'animaux abandonnés.`,
      },
      {
        heading: "4. Paiement Sécurisé",
        content: `Les paiements sont traités instantanément par **Stripe** (Cartes bancaires, Apple Pay, Google Pay) sous chiffrement de bout en bout et authentification forte SCA (directive DSP2).`,
      },
      {
        heading: "5. Renonciation au Droit de Rétractation (Contenu Numérique Personnalisé)",
        content: `Conformément à l'**article L. 221-28 du Code de la consommation** et à la directive européenne 2011/83/UE :

> *"Le droit de rétractation ne peut être exercé pour les contrats de fourniture d'un contenu numérique sans support matériel dont l'exécution a commencé avec l'accord préalable exprès du consommateur et son renoncement exprès à son droit de rétractation."*

En validant son paiement, l'utilisateur demande et accepte expressément l'exécution immédiate de la prestation (génération du code, inscription sur le mur, rendu des certificats). Par conséquent, **aucun droit de rétractation ni remboursement ne peut être accordé une fois les documents générés**.`,
      },
      {
        heading: "6. Modération et Contenus Autorisés",
        content: `- L'utilisateur garantit que la photo représente un véritable animal de compagnie et qu'il dispose des droits nécessaires.
- **Contenus interdits :** Visages humains sans consentement, contenus haineux, violents, maltraitance animale ou marques tierces illicites.
- La Plateforme se réserve le droit de retirer sans délai ni indemnité tout contenu non conforme.`,
      },
      {
        heading: "7. Disponibilité du Service",
        content: `The Internet Pet Wall s'efforce d'assurer une disponibilité maximale grâce à une infrastructure cloud résiliente. Des interruptions temporaires pour maintenance ou aléas réseau restent toutefois possibles.`,
      },
      {
        heading: "8. Droit Applicable et Litiges",
        content: `Les présentes conditions sont soumises au droit applicable. En cas de litige, les tribunaux compétents seront ceux du domicile du consommateur. Plateforme de règlement en ligne des litiges de l'UE : https://ec.europa.eu/consumers/odr.`,
      },
    ],
  },

  cookies: {
    id: "cookies",
    badge: "ePrivacy & Stockage Local",
    title: "Politique de Cookies et Stockage Local",
    subtitle: "Transparence totale : Quelles technologies nous utilisons sur votre navigateur et pourquoi",
    lastUpdated: "Septembre 2026",
    sections: [
      {
        heading: "1. Que sont les cookies et le stockage local (localStorage) ?",
        content: `Un cookie ou élément de stockage local (*localStorage*) est une information stockée par un site dans votre navigateur pour mémoriser vos choix et assurer la fluidité et la sécurité de l'expérience utilisateur.`,
      },
      {
        heading: "2. Notre Philosophie : Zéro Traçage Intrusif",
        content: `Sur **The Internet Pet Wall, nous respectons scrupuleusement votre vie privée** :

- **AUCUN cookie publicitaire tiers**.
- **AUCUN profilage comportemental ou commercial**.
- **AUCUNE revente de vos données**.

Nous utilisons uniquement des technologies **strictement techniques et fonctionnelles**, nécessaires au fonctionnement du service.`,
      },
      {
        heading: "3. Inventaire Détaillé du Stockage Local (localStorage)",
        content: `Voici le détail complet des clés stockées sur votre appareil :

- **\`pet_wall_treat_cooldowns_v1\`** (Technique / Anti-Spam) : 300 secondes (5 min) par animal. Gère le minuteur de compte à rebours pour désactiver le bouton de friandise et protéger les serveurs contre les abus.
- **\`pet_wall_lang\`** (Préférence) : Persistant. Mémorise votre langue (espagnol, anglais, français, allemand).
- **\`pet_wall_theme\`** (Préférence) : Persistant. Mémorise votre choix de mode sombre ou clair.
- **\`pet_wall_my_ids\`** (Fonctionnel) : Persistant. Conserve les identifiants de vos animaux enregistrés ou favoris directement sur votre appareil, sans besoin de mot de passe.
- **\`pending_pet_checkout\`** (sessionStorage) : Session temporaire. Permet d'afficher votre passeport officiel immédiatement après votre retour du paiement Stripe.`,
      },
      {
        heading: "4. Cookies Tiers Strictement Nécessaires",
        content: `- **Stripe Payments Europe, Ltd. :** Lors du paiement sécurisé, Stripe dépose des cookies antifraude nécessaires (\`__stripe_mid\`, \`__stripe_sid\`) pour garantir la conformité aux exigences bancaires internationales.`,
      },
      {
        heading: "5. Dispense de Consentement Préalable pour les Données Techniques",
        content: `Conformément aux directives européennes ePrivacy et de la CNIL, les traceurs et stockages strictement nécessaires à la fourniture d'un service expressément demandé sont **exemptés de consentement préalable**. Nous mettons néanmoins à votre disposition un bandeau transparent et un sélecteur de préférences complet.`,
      },
      {
        heading: "6. Gestion et Suppression dans votre Navigateur",
        content: `Vous pouvez supprimer ou bloquer ces éléments à tout moment via les paramètres de confidentialité de votre navigateur (Chrome, Safari, Firefox, Edge). La suppression réinitialisera vos préférences de langue et vos animaux sauvegardés.`,
      },
    ],
  },

  legal: {
    id: "legal",
    badge: "Mentions Légales",
    title: "Mentions Légales et Informations Générales",
    subtitle: "Informations d'identification, propriété et conditions d'accès au service",
    lastUpdated: "Septembre 2026",
    sections: [
      {
        heading: "1. Identification de l'Éditeur",
        content: `Conformément aux obligations légales d'information, voici les données relatives à l'éditeur :

- **Nom du Projet :** The Internet Pet Wall
- **Activité :** Mémorial numérique d'hommage aux animaux de compagnie, émission de passeports commémoratifs et médailles QR.
- **Contact Électronique :** contact@theinternetpetwall.com / legal@theinternetpetwall.com
- **Site Officiel :** https://theinternetpetwall.com`,
      },
      {
        heading: "2. Propriété Intellectuelle et Industrielle",
        content: `L'ensemble des éléments du site (code source, graphismes, logos, architecture, textes) est la propriété exclusive de The Internet Pet Wall ou fait l'objet d'autorisations régulières.

Les photographies ajoutées par les utilisateurs restent leur propriété exclusive. En les publiant, l'utilisateur accorde à The Internet Pet Wall une licence mondiale, gratuite et non exclusive pour leur intégration et affichage technique sur la mosaïque et les documents associés.`,
      },
      {
        heading: "3. Conditions d'Usage et Responsabilité",
        content: `L'utilisateur s'engage à utiliser le service de bonne foi, sans introduire de virus, scripts de surcharge ou contenus illicites.

The Internet Pet Wall décline toute responsabilité quant aux liens ou informations externes introduits par les utilisateurs (par ex. liens vers profils Instagram).`,
      },
    ],
  },
};

const GERMAN_LEGAL = {
  privacy: {
    id: "privacy",
    badge: "DSGVO & Datenschutz",
    title: "Datenschutzerklärung & Datenschutzrichtlinie",
    subtitle: "Klare und transparente Informationen darüber, wie wir Ihre Daten und das Andenken an Ihr Haustier schützen",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "1. Verantwortliche Stelle",
        content: `Verantwortlicher für die Datenverarbeitung auf dieser Website ist **The Internet Pet Wall** (nachfolgend „Die Plattform“), erreichbar per E-Mail unter **privacy@theinternetpetwall.com**.

Die Plattform ist als öffentlich zugängliches digitales Gedenkmosaik konzipiert, das Haustieren und Begleitern weltweit Anerkennung und ein ewiges Andenken schenkt.`,
      },
      {
        heading: "2. Erhobene personenbezogene Daten",
        content: `Wir erheben ausschließlich Daten, die für die Bereitstellung des Gedenkdienstes und die Ausstellung des offiziellen Passes unverzichtbar sind:

- **Haustier- und Halterdaten:** Name des Haustieres, Tierart, Rasse, Geburtsjahr/-datum, persönliche Widmung, Stadt, Bundesland/Land, Foto des Tieres sowie freiwillig Haltername und öffentlicher Instagram-Account.
- **Zahlungs- und Abrechnungsdaten:** Zahlungen werden vollständig verschlüsselt über **Stripe Payments Europe, Ltd.** unter Verwendung von TLS 1.3 und PCI-DSS Level 1 Zertifizierung abgewickelt. Die Plattform **speichert, sieht oder verarbeitet zu keinem Zeitpunkt** Kredit- oder Debitkartennummern oder Sicherheitscodes (CVC/CVV).
- **Technische Sicherheits- und Verbindungsprotokolle (Logs):** Bei Aktionen wie dem Versenden von Leckerlis wird temporär die IP-Adresse erfasst, ausschließlich für **IT-Sicherheit, Abwehr automatisierter Angriffe und Frequenzbegrenzung (Rate-Limiting)**.`,
      },
      {
        heading: "3. Zwecke der Datenverarbeitung",
        content: `Wir verarbeiten personenbezogene Daten für folgende Zwecke:

1. **Ewiges Gedenken & Präsentation:** Dauerhafte Veröffentlichung des Profils auf der Großen Haustierwand und dem Ehrenpodest.
2. **Ausstellung offizieller Dokumente:** Erstellung des hochauflösenden Digitalen Reisepasses (PNG) mit internationalem Registrierungscode und digitaler QR-Plakette.
3. **Sicherheit & Spamschutz:** Verwaltung des 5-minütigen Cooldown-Timers beim Versenden von Leckerlis zur Vermeidung von Serverüberlastungen.
4. **Nutzerbetreuung:** Bearbeitung von Anfragen, Korrekturen oder Löschanträgen durch Tierhalter.`,
      },
      {
        heading: "4. Rechtsgrundlagen der Verarbeitung",
        content: `Die Verarbeitung stützt sich auf die Datenschutz-Grundverordnung (DSGVO):

- **Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):** Erforderlich zur Durchführung der Registrierung, Passausstellung und Veröffentlichung.
- **Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):** Ausdrücklich erteilt beim Hochladen des Fotos und Absenden des Formulars.
- **Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO):** Zur Gewährleistung der Netzwerk- und Informationssicherheit sowie Abwehr von DDoS-Angriffen.`,
      },
      {
        heading: "5. Empfänger und Dienstleister",
        content: `Ihre Daten werden weder verkauft noch an Werbetreibende weitergegeben. Es kommen ausschließlich verifizierte technische Dienstleister zum Einsatz:

- **Stripe Payments Europe, Ltd. (Irland / EU):** Sichere Zahlungsabwicklung und Betrugsprävention.
- **Supabase Inc. (Cloud-Infrastruktur):** Sichere Datenbanken und globales CDN für schnelle Auslieferung von Fotos unter strengen Auftragsverarbeitungsverträgen (AVV).`,
      },
      {
        heading: "6. Speicherdauer",
        content: `- **Gedenkprofile auf der Wand:** Wegen des dauerhaften Charakters bleiben Daten unbefristet sichtbar, solange die Plattform existiert, sofern keine Löschung verlangt wird.
- **Technische Leckerli-Logs:** Werden nur für die zur Cooldown-Durchsetzung notwendige Dauer vorgehalten und danach automatisch bereinigt.`,
      },
      {
        heading: "7. Ihre Rechte nach der DSGVO",
        content: `Ihnen stehen folgende gesetzliche Rechte zu:

- Recht auf **Auskunft** über Ihre gespeicherten Daten und **Berichtigung**.
- Recht auf **Löschung** („Recht auf Vergessenwerden“) des Profils und Fotos.
- Recht auf **Einschränkung der Verarbeitung**, **Widerspruch** und **Datenübertragbarkeit**.

Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter **privacy@theinternetpetwall.com** unter Angabe des offiziellen Haustier-Codes (*z.B. PET-0014-ES*). Ihnen steht zudem ein Beschwerderecht bei der zuständigen Datenschutzaufsichtsbehörde zu.`,
      },
    ],
  },

  terms: {
    id: "terms",
    badge: "Verbraucherschutz & E-Commerce",
    title: "Allgemeine Geschäfts- und Einkaufsbedingungen",
    subtitle: "Bedingungen für das digitale Haustier-Gedenken, Passausstellung und Plattformnutzung",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "1. Gegenstand des Dienstes",
        content: `Diese Allgemeinen Geschäftsbedingungen regeln die Inanspruchnahme des digitalen Gedenkdienstes auf **The Internet Pet Wall** (YourPixel).

Der Dienst umfasst:
- Zuweisung eines dauerhaften Gedenkplatzes auf dem interaktiven Mosaik.
- Zuweisung eines einmaligen internationalen Registrierungscodes (z.B. *PET-0001-ES*).
- Sofortige Bereitstellung des hochauflösenden Digitalen Passes (PNG) zum Download und Ausdrucken.
- Bereitstellung einer digitalen QR-Plakette mit Direktlink zum Haustierprofil.
- Aktivierung des interaktiven Leckerli- und Anerkennungssystems.`,
      },
      {
        heading: "2. Varianten und Preise",
        content: `Aktuelle Tarife:

- **Standard-Eintrag: 1,00 € (einmalig)**. Lebenslanger Eintrag, offizielle Profilkarte, Standard-Plakette und digitaler Pass.
- **VIP Gold-Eintrag: 2,00 € (einmalig)**. Enthält alle Standard-Funktionen mit irisierendem Goldrahmen, VIP-Krone, Filter-Priorität und erhöhter Sichtbarkeit auf dem Podest.

Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer (MwSt.). Keine Abonnements oder versteckten Folgekosten.`,
      },
      {
        heading: "3. Wohltätiger Zweck: 1 Eintrag = 1 Helfende Pfote",
        content: `**20 % des Nettoerlöses jeder Registrierung** wird regelmäßig an anerkannte Tierschutzvereine und Tierheime gespendet, um Futter und medizinische Versorgung für herrenlose Tiere zu finanzieren.`,
      },
      {
        heading: "4. Zahlung und Sicherheit",
        content: `Zahlungen erfolgen unmittelbar über **Stripe** (Kreditkarten, Apple Pay, Google Pay) mit Ende-zu-Ende-Verschlüsselung und starker Kundenauthentifizierung (SCA nach PSD2-Richtlinie).`,
      },
      {
        heading: "5. Ausschluss des Widerrufsrechts (Digitale Inhalte nach Maß)",
        content: `Gemäß **§ 356 Abs. 5 BGB** und Art. 16 lit. m der EU-Verbraucherrechterichtlinie (2011/83/EU):

> *"Das Widerrufsrecht erlischt bei einem Vertrag über die Lieferung von nicht auf einem körperlichen Datenträger befindlichen digitalen Inhalten, wenn der Unternehmer mit der Ausführung des Vertrags begonnen hat, nachdem der Verbraucher ausdrücklich zugestimmt hat und seine Kenntnis davon bestätigt hat, dass er hierdurch sein Widerrufsrecht verliert."*

Mit Abschluss des Bezahlvorgangs verlangt und willigt der Nutzer ausdrücklich in die sofortige Bereitstellung des Dienstes ein (Codegenerierung, Wandfreischaltung, Pass-Erstellung). Daher besteht **nach Generierung der digitalen Dokumente kein Widerrufs- oder Erstattungsanspruch**.`,
      },
      {
        heading: "6. Richtlinien für zulässige Inhalte",
        content: `- Der Nutzer garantiert, dass das hochgeladene Foto ein echtes Haustier zeigt und er die erforderlichen Nutzungsrechte besitzt.
- **Unzulässige Inhalte:** Fotos von Personen ohne Einwilligung, diskriminierende, gewaltverherrlichende, tierquälerische oder rechtswidrige Bilder sind untersagt.
- Die Plattform behält sich vor, unzulässige Einträge ohne Anspruch auf Erstattung unverzüglich zu deaktivieren.`,
      },
      {
        heading: "7. Verfügbarkeit und Gewährleistung",
        content: `The Internet Pet Wall strebt maximale Verfügbarkeit durch redundante Cloud-Server und Backups an. Temporäre Ausfälle durch globale Netzstörungen oder Wartungsarbeiten können jedoch nicht vollständig ausgeschlossen werden.`,
      },
      {
        heading: "8. Anwendbares Recht und Streitbeilegung",
        content: `Es gilt das anwendbare Recht. Für Verbraucher gilt der Gerichtsstand ihres Wohnsitzes. Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr.`,
      },
    ],
  },

  cookies: {
    id: "cookies",
    badge: "TTDSG & Technischer Speicher",
    title: "Cookie- und Speicher-Richtlinie",
    subtitle: "Vollständige Transparenz: Welche technischen Speichertechnologien in Ihrem Browser genutzt werden",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "1. Was sind Cookies und lokaler Speicher (localStorage)?",
        content: `Ein Cookie oder lokaler Speicher (*localStorage*) ist eine kleine Informationseinheit, die eine Website in Ihrem Browser speichert, um Einstellungen zu behalten und die sichere Ausführung zu gewährleisten.`,
      },
      {
        heading: "2. Unsere Philosophie: Kein aufdringliches Tracking",
        content: `Auf **The Internet Pet Wall achten wir zu 100 % auf Ihre Privatsphäre**:

- **KEINE Werbe-Tracking-Cookies von Drittanbietern**.
- **KEINE kommerzielle Profilbildung Ihres Verhaltens**.
- **KEIN Verkauf von Daten an Werbenetzwerke**.

Wir setzen ausschließlich **technisch notwendige und funktionale** Speichermechanismen ein, die für den Betrieb unerlässlich sind.`,
      },
      {
        heading: "3. Detaillierte Übersicht des lokalen Speichers (localStorage)",
        content: `Hier finden Sie eine genaue Aufstellung aller genutzten Speicherelemente:

- **\`pet_wall_treat_cooldowns_v1\`** (Technisch / Spamschutz): 300 Sekunden (5 Minuten) pro Tier. Speichert den Ablaufzeitpunkt, um den Leckerli-Knopf zu sperren und den Timer anzuzeigen, damit Server vor Überlastung geschützt werden.
- **\`pet_wall_lang\`** (Einstellung): Dauerhaft. Speichert die gewählte Sprache (Spanisch, Englisch, Französisch, Deutsch).
- **\`pet_wall_theme\`** (Einstellung): Dauerhaft. Speichert die Wahl von Hell- oder Dunkelmodus.
- **\`pet_wall_my_ids\`** (Funktional): Dauerhaft. Speichert die IDs Ihrer registrierten oder favorisierten Tiere direkt auf Ihrem Gerät, ohne dass Sie ein Passwort anlegen müssen.
- **\`pending_pet_checkout\`** (sessionStorage): Temporäre Sitzung. Dient der Übergabe Ihres Haustierpasses direkt nach Rückkehr von der Stripe-Bezahlung.`,
      },
      {
        heading: "4. Unbedingt erforderliche Drittanbieter-Cookies",
        content: `- **Stripe Payments Europe, Ltd.:** Während des Bezahlvorgangs setzt Stripe zwingend erforderliche Betrugserkennungs-Cookies (\`__stripe_mid\`, \`__stripe_sid\`) zur Einhaltung internationaler Bankensicherheitsstandards.`,
      },
      {
        heading: "5. Einwilligungsausnahme für technisch notwendige Daten",
        content: `Nach § 25 Abs. 2 TTDSG und europäischen Richtlinien ist die Speicherung von Daten, die zur Bereitstellung eines vom Nutzer ausdrücklich gewünschten Dienstes zwingend erforderlich sind, **von der Pflicht zur vorherigen Einwilligung befreit**. Dennoch stellen wir ein transparentes Banner mit individuellen Einstellmöglichkeiten bereit.`,
      },
      {
        heading: "6. Verwaltung und Löschung im Browser",
        content: `Sie können diese Daten jederzeit über die Einstellungen Ihres Browsers (Chrome, Safari, Firefox, Edge) löschen oder blockieren. Beim Löschen werden Spracheinstellungen und gespeicherte Haustiere zurückgesetzt.`,
      },
    ],
  },

  legal: {
    id: "legal",
    badge: "Impressum & Rechtliches",
    title: "Impressum und rechtliche Angaben",
    subtitle: "Angaben zur Identifikation des Anbieters und Nutzungsbedingungen der Plattform",
    lastUpdated: "September 2026",
    sections: [
      {
        heading: "1. Angaben zum Anbieter",
        content: `Angaben gemäß gesetzlicher Informationspflichten:

- **Projektbezeichnung:** The Internet Pet Wall
- **Tätigkeit:** Digitales Gedenkportal für Haustiere, Ausstellung digitaler Ausweise und QR-Plaketten.
- **Elektronischer Kontakt:** contact@theinternetpetwall.com / legal@theinternetpetwall.com
- **Offizielle Website:** https://theinternetpetwall.com`,
      },
      {
        heading: "2. Urheber- und Leistungsschutzrechte",
        content: `Alle Inhalte und Werke dieser Website (Quellcode, Grafiken, Logos, Softwarearchitektur, Texte) unterliegen dem Urheberrecht von The Internet Pet Wall oder sind lizenziert.

Von Nutzern hochgeladene Fotos verbleiben im geistigen Eigentum des jeweiligen Urhebers. Mit dem Hochladen räumt der Nutzer The Internet Pet Wall eine weltweite, gebührenfreie, nicht-exklusive Lizenz zur technischen Verarbeitung, Aufbereitung und Darstellung innerhalb der Wand und Dokumente ein.`,
      },
      {
        heading: "3. Nutzungsbedingungen und Haftung",
        content: `Der Nutzer verpflichtet sich zur rechtmäßigen Nutzung der Plattform und unterlässt das Einschleusen schädlicher Programme oder rechtswidriger Inhalte.

The Internet Pet Wall übernimmt keine Haftung für externe Links oder Profile, die von Nutzern eigenverantwortlich angegeben wurden (z.B. Instagram-Links).`,
      },
    ],
  },
};

export const LEGAL_TEXTS = {
  es: SPANISH_LEGAL,
  en: ENGLISH_LEGAL,
  fr: FRENCH_LEGAL,
  de: GERMAN_LEGAL,
};

// Backward-compatibility references for existing code
LEGAL_TEXTS.privacy = SPANISH_LEGAL.privacy;
LEGAL_TEXTS.terms = SPANISH_LEGAL.terms;
LEGAL_TEXTS.cookies = SPANISH_LEGAL.cookies;
LEGAL_TEXTS.legal = SPANISH_LEGAL.legal;
