'use client';

// ─── 12-Language Support ───

export type SupportedLang = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ar' | 'pt' | 'ru' | 'hi' | 'it' | 'nl';

export const LANGUAGES: { code: SupportedLang; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
];

// ─── Static Translations (greetings & UI) ───

const GREETINGS: Record<SupportedLang, string> = {
  en: 'Hello! I am Hyperion Assistant. I can answer questions about the platform, its agents, and features. How can I help you?',
  es: '¡Hola! Soy Asistente Hyperion. Puedo responder preguntas sobre la plataforma, sus agentes y características. ¿Cómo puedo ayudarte?',
  fr: 'Bonjour ! Je suis l\'Assistant Hyperion. Je peux répondre aux questions sur la plateforme, ses agents et fonctionnalités. Comment puis-je vous aider ?',
  de: 'Hallo! Ich bin Hyperion Assistant. Ich kann Fragen zur Plattform, ihren Agenten und Funktionen beantworten. Wie kann ich Ihnen helfen?',
  zh: '你好！我是 Hyperion 助手。我可以回答关于平台、代理和功能的问题。我能帮你什么？',
  ja: 'こんにちは！ハイペリオンアシスタントです。プラットフォーム、エージェント、機能についての質問にお答えします。どのようにお手伝いしましょうか？',
  ko: '안녕하세요! Hyperion 도우미입니다. 플랫폼, 에이전트 및 기능에 대한 질문에 답변할 수 있습니다. 어떻게 도와드릴까요?',
  ar: 'مرحباً! أنا مساعد Hyperion. يمكنني الإجابة على أسئلة حول المنصة ووكلائها وميزاتها. كيف يمكنني مساعدتك؟',
  pt: 'Olá! Sou o Assistente Hyperion. Posso responder perguntas sobre a plataforma, seus agentes e recursos. Como posso ajudá-lo?',
  ru: 'Здравствуйте! Я помощник Hyperion. Я могу ответить на вопросы о платформе, её агентах и функциях. Чем я могу вам помочь?',
  hi: 'नमस्ते! मैं हाइपेरियन सहायक हूं। मैं प्लेटफॉर्म, इसके एजेंट और सुविधाओं के बारे में सवालों के जवाब दे सकता हूं। मैं आपकी कैसे मदद कर सकता हूं?',
  it: 'Ciao! Sono l\'Assistente Hyperion. Posso rispondere a domande sulla piattaforma, i suoi agenti e funzionalità. Come posso aiutarti?',
  nl: 'Hallo! Ik ben Hyperion Assistant. Ik kan vragen beantwoorden over het platform, de agents en functies. Hoe kan ik u helpen?',
};

export function getGreeting(lang: SupportedLang): string {
  return GREETINGS[lang] || GREETINGS.en;
}

// ─── Platform Knowledge Base ───

interface KBEntry {
  keywords: string[];
  response: Record<SupportedLang, string>;
  category: string;
}

const KB: KBEntry[] = [
  {
    keywords: ['scout', 'agent 1', 'first agent', 'anomaly', 'scan', 'detect'],
    category: 'agents',
    response: {
      en: 'The Scout Agent is Hyperion\'s first responder. It ingests CSV datasets and scans for statistical anomalies using outlier detection. It analyzes 8 telemetry metrics (throughput, latency, error rate, cyber alerts, energy, supply chain, financial volatility, satellite signal) and flags any values exceeding 1.8 standard deviations from the mean. Results appear in the War Room graph and Threat Dashboard.',
      es: 'El Agente Scout es el primer respondedor de Hyperion. Ingiere conjuntos de datos CSV y escanea anomalías estadísticas mediante detección de valores atípicos. Analiza 8 métricas de telemetría y marca valores que exceden 1.8 desviaciones estándar de la media.',
      fr: 'L\'Agent Scout est le premier intervenant d\'Hyperion. Il ingère des ensembles de données CSV et recherche des anomalies statistiques. Il analyse 8 métriques de télémétrie et signale les valeurs dépassant 1.8 écarts-types de la moyenne.',
      de: 'Der Scout-Agent ist Hyperions Ersthelfer. Er nimmt CSV-Datensätze auf und scannt nach statistischen Anomalien. Er analysiert 8 Telemetriemetriken und markiert Werte, die 1.8 Standardabweichungen vom Mittelwert überschreiten.',
      zh: '侦察代理是 Hyperion 的第一响应者。它摄取 CSV 数据集并使用离群值检测扫描统计异常。它分析 8 个遥测指标，并标记超过平均值 1.8 个标准偏差的值。',
      ja: 'スカウトエージェントはHyperionのファーストレスポンダーです。CSVデータセットを取り込み、外れ値検出を使用して統計的異常をスキャンします。8つのテレメトリーメトリクスを分析します。',
      ko: 'Scout 에이전트는 Hyperion의 첫 번째 대응자입니다. CSV 데이터 세트를 수집하고 이상값 감지를 사용하여 통계적 이상을 스캔합니다. 8개의 텔레메트리 메트릭을 분석합니다.',
      ar: 'وكيل الكشافة هو المستجيب الأول لـ Hyperion. يقوم بابتلاع مجموعات بيانات CSV ومسح الحالات الشاذة الإحصائية. يقوم بتحليل 8 مقاييس عن بعد.',
      pt: 'O Agente Scout é o primeiro respondedor do Hyperion. Ele ingere conjuntos de dados CSV e verifica anomalias estatísticas. Analisa 8 métricas de telemetria.',
      ru: 'Скаут-агент — первый responder Hyperion. Он загружает наборы данных CSV и сканирует статистические аномалии. Анализирует 8 телеметрических метрик.',
      hi: 'स्काउट एजेंट हाइपेरियन का पहला प्रतिसादकर्ता है। यह CSV डेटासेट को इन्जेस्ट करता है और सांख्यिकीय विसंगतियों के लिए स्कैन करता है। यह 8 टेलीमेट्री मेट्रिक्स का विश्लेषण करता है।',
      it: 'L\'Agente Scout è il primo risponditore di Hyperion. Ingesta dataset CSV e scansiona anomalie statistiche. Analizza 8 metriche di telemetria.',
      nl: 'De Scout Agent is de eerste responder van Hyperion. Het neemt CSV-datasets op en scant op statistische afwijkingen. Het analyseert 8 telemetriestatistieken.',
    },
  },
  {
    keywords: ['strategist', 'agent 2', 'second agent', 'scenario', 'simulate', 'impact', 'risk'],
    category: 'agents',
    response: {
      en: 'The Strategist Agent models escalation scenarios from anomalies detected by the Scout. Each scenario includes a probability score (60-90%), impact assessment, cost estimate (in dollars), and response timeline. It projects cascade effects across dependent systems. Results feed into the Tactical Agent for mitigation planning.',
      es: 'El Agente Estratega modela escenarios de escalada a partir de anomalías detectadas por Scout. Cada escenario incluye probabilidad, evaluación de impacto, costo estimado y cronograma. Los resultados alimentan al Agente Táctico.',
      fr: 'L\'Agent Stratégiste modélise les scénarios d\'escalade à partir des anomalies détectées par Scout. Chaque scénario inclut probabilité, impact, coût et calendrier.',
      de: 'Der Strategie-Agent modelliert Eskalationsszenarien aus vom Scout erkannten Anomalien. Jedes Szenario enthält Wahrscheinlichkeit, Auswirkung, Kosten und Zeitplan.',
      zh: '战略代理根据侦察代理检测到的异常建模升级场景。每个场景包括概率、影响评估、成本估算和时间表。',
      ja: 'ストラテジストエージェントは、スカウトが検出した異常からエスカレーションシナリオをモデル化します。各シナリオには確率、影響評価、コスト見積もりが含まれます。',
      ko: 'Strategist 에이전트는 Scout이 감지한 이상에서 에스컬레이션 시나리오를 모델링합니다. 각 시나리오에는 확률, 영향 평가, 비용 추정치가 포함됩니다.',
      ar: 'وكيل الاستراتيجي يصوغ سيناريوهات التصعيد من الحالات الشاذة التي يكتشفها الكشاف. كل سيناريو يتضمن الاحتمالية وتقييم التأثير والتكلفة.',
      pt: 'O Agente Estrategista modela cenários de escalada a partir de anomalias detectadas pelo Scout. Cada cenário inclui probabilidade, impacto, custo e prazo.',
      ru: 'Стратег-агент моделирует сценарии эскалации на основе аномалий, обнаруженных Скаутом. Каждый сценарий включает вероятность, оценку воздействия, стоимость.',
      hi: 'रणनीतिकार एजेंट स्काउट द्वारा पाई गई विसंगतियों से एस्केलेशन परिदृश्यों का मॉडल बनाता है। प्रत्येक परिदृश्य में संभाव्यता, प्रभाव मूल्यांकन, लागत शामिल है।',
      it: 'L\'Agente Strategista modella scenari di escalation dalle anomalie rilevate da Scout. Ogni scenario include probabilità, impatto, costo e tempistica.',
      nl: 'De Strategist Agent modelleert escalatiescenario\'s op basis van door Scout gedetecteerde afwijkingen. Elk scenario omvat kans, impact, kosten en tijdlijn.',
    },
  },
  {
    keywords: ['tactical', 'agent 3', 'third agent', 'action', 'mitigate', 'execute', 'api'],
    category: 'agents',
    response: {
      en: 'The Tactical Agent formulates concrete mitigation actions. It generates 5-7 actions including API calls, stakeholder notifications, resource reallocation, security patches, and supplier negotiations. Each action targets a specific system (Automated Response System, Enterprise Notification Service, Deployment Pipeline, etc.) and has a pending/executing/completed status.',
      es: 'El Agente Táctico formula acciones de mitigación concretas. Genera 5-7 acciones que incluyen llamadas API, notificaciones, reasignación de recursos, parches de seguridad y negociaciones.',
      fr: 'L\'Agent Tactique formule des actions de mitigation concrètes. Il génère 5-7 actions incluant appels API, notifications, réallocation de ressources, correctifs de sécurité.',
      de: 'Der Taktik-Agent formuliert konkrete Abhilfemaßnahmen. Er generiert 5-7 Aktionen inklusive API-Aufrufen, Benachrichtigungen, Ressourcenumverteilung.',
      zh: '战术代理制定具体的缓解措施。它生成 5-7 个操作，包括 API 调用、通知、资源重新分配、安全补丁。',
      ja: 'タクティカルエージェントは具体的な緩和アクションを策定します。APIコール、通知、リソース再割り当て、セキュリティパッチなどを含む5〜7のアクションを生成します。',
      ko: 'Tactical 에이전트는 구체적인 완화 조치를 공식화합니다. API 호출, 알림, 리소스 재할당, 보안 패치 등을 포함한 5-7개의 작업을 생성합니다.',
      ar: 'وكيل التكتيكي يصوغ إجراءات تخفيف ملموسة. يولد 5-7 إجراءات تشمل استدعاءات API والإشعارات وإعادة تخصيص الموارد.',
      pt: 'O Agente Tático formula ações de mitigação concretas. Gera 5-7 ações incluindo chamadas de API, notificações, realocação de recursos, patches de segurança.',
      ru: 'Тактический агент формулирует конкретные меры по смягчению. Генерирует 5-7 действий, включая API-вызовы, уведомления, перераспределение ресурсов.',
      hi: 'सामरिक एजेंट ठोस शमन कार्रवाई तैयार करता है। यह API कॉल, सूचनाएं, संसाधन पुनर्वितरण सहित 5-7 क्रियाएं उत्पन्न करता है।',
      it: 'L\'Agente Tattico formula azioni di mitigazione concrete. Genera 5-7 azioni includendo chiamate API, notifiche, riallocazione delle risorse.',
      nl: 'De Tactical Agent formuleert concrete mitigatieacties. Het genereert 5-7 acties waaronder API-aanroepen, meldingen, hertoewijzing van middelen.',
    },
  },
  {
    keywords: ['commander', 'agent 4', 'fourth agent', 'approve', 'authorize', 'orchestrate'],
    category: 'agents',
    response: {
      en: 'The Commander Agent is the final decision-maker. It reviews the Tactical Agent\'s plan, authorizes mitigations, and logs all decisions. When approved, it deploys all countermeasures and activates autonomous protocols. You can also authorize via voice command: say "Hyperion, authorize" to approve the current plan.',
      es: 'El Agente Comandante es el tomador de decisiones final. Revisa el plan táctico, autoriza mitigaciones y registra todas las decisiones. Puede autorizar por comando de voz.',
      fr: 'L\'Agent Commandant est le décideur final. Il examine le plan tactique, autorise les mesures d\'atténuation et enregistre toutes les décisions.',
      de: 'Der Kommandant-Agent ist der endgültige Entscheidungsträger. Er prüft den taktischen Plan, genehmigt Maßnahmen und protokolliert alle Entscheidungen.',
      zh: '指挥官代理是最终决策者。它审查战术计划，授权缓解措施，并记录所有决策。',
      ja: 'コマンダーエージェントは最終的な意思決定者です。戦術計画をレビューし、緩和策を承認し、すべての決定を記録します。',
      ko: 'Commander 에이전트는 최종 의사 결정자입니다. 전술 계획을 검토하고, 완화 조치를 승인하며, 모든 결정을 기록합니다.',
      ar: 'وكيل القائد هو صاحب القرار النهائي. يراجع الخطة التكتيكية ويصرح بالتخفيفات ويسجل جميع القرارات.',
      pt: 'O Agente Comandante é o tomador de decisão final. Revisa o plano tático, autoriza mitigações e registra todas as decisões.',
      ru: 'Командир-агент — конечный принимающий решения. Он просматривает тактический план, авторизует меры и регистрирует все решения.',
      hi: 'कमांडर एजेंट अंतिम निर्णयकर्ता है। यह सामरिक योजना की समीक्षा करता है, शमन को अधिकृत करता है, और सभी निर्णयों को लॉग करता है।',
      it: 'L\'Agente Comandante è il decisore finale. Esamina il piano tattico, autorizza le mitigazioni e registra tutte le decisioni.',
      nl: 'De Commander Agent is de uiteindelijke beslisser. Het beoordeelt het tactische plan, autoriseert maatregelen en logt alle beslissingen.',
    },
  },
  {
    keywords: ['war room', 'view', 'dashboard', 'interface', 'ui'],
    category: 'features',
    response: {
      en: 'Hyperion has 5 main views: 1) War Room — the command center with the agent graph and communication feed. 2) Intelligence — upload CSV datasets for analysis. 3) Threats — the detailed dashboard with anomalies, scenarios, and mitigations. 4) Tickets — autonomous support ticket resolution orchestrator. 5) Code AI — self-correcting code generation agent. Navigate via the top nav bar or voice commands.',
      es: 'Hyperion tiene 5 vistas principales: Sala de Guerra, Inteligencia, Amenazas, Tickets y Code AI. Navegue por la barra superior o comandos de voz.',
      fr: 'Hyperion a 5 vues principales : War Room, Intelligence, Menaces, Tickets et Code AI. Naviguez via la barre supérieure ou les commandes vocales.',
      de: 'Hyperion hat 5 Hauptansichten: Kriegsraum, Nachrichten, Bedrohungen, Tickets und Code AI. Navigation über die obere Leiste oder Sprachbefehle.',
      zh: 'Hyperion 有 5 个主要视图：作战室、情报、威胁、工单和代码 AI。通过顶部导航栏或语音命令导航。',
      ja: 'Hyperionには5つの主要ビューがあります：ウォールーム、インテリジェンス、脅威、チケット、コードAI。上部ナビバーまたは音声コマンドで移動します。',
      ko: 'Hyperion에는 5개의 주요 보기가 있습니다: War Room, Intelligence, Threats, Tickets, Code AI. 상단 탐색 모음 또는 음성 명령으로 탐색합니다.',
      ar: 'Hyperion لديه 5 طرق عرض رئيسية: غرفة الحرب، الاستخبارات، التهديدات، التذاكر، وكود الذكاء الاصطناعي. التنقل عبر الشريط العلوي أو الأوامر الصوتية.',
      pt: 'Hyperion tem 5 visualizações principais: War Room, Inteligência, Ameaças, Tickets e Code AI. Navegue pela barra superior ou comandos de voz.',
      ru: 'Hyperion имеет 5 основных видов: Комната войны, Разведка, Угрозы, Тикеты и Code AI. Навигация через верхнюю панель или голосовые команды.',
      hi: 'Hyperion में 5 मुख्य दृश्य हैं: War Room, Intelligence, Threats, Tickets और Code AI। शीर्ष नेव बार या वॉइस कमांड से नेविगेट करें।',
      it: 'Hyperion ha 5 viste principali: War Room, Intelligence, Threats, Tickets e Code AI. Naviga tramite la barra superiore o i comandi vocali.',
      nl: 'Hyperion heeft 5 hoofdweergaven: War Room, Intelligence, Threats, Tickets en Code AI. Navigeer via de bovenste navigatiebalk of spraakopdrachten.',
    },
  },
  {
    keywords: ['voice', 'command', 'speak', 'mic', 'speech', 'say'],
    category: 'features',
    response: {
      en: 'Hyperion supports full voice navigation. Click the microphone icon in the nav bar to start listening. Say commands like "Open War Room", "Show dashboard", "Deploy analysis", "Status report", "Authorize protocol", or "Open tickets". The system speaks back responses using Text-to-Speech. Available in all supported browsers with Web Speech API.',
      es: 'Hyperion admite navegación por voz completa. Haga clic en el micrófono y diga comandos como "Abrir sala de guerra" o "Mostrar panel".',
      fr: 'Hyperion prend en charge la navigation vocale complète. Cliquez sur le microphone et dites des commandes comme "Ouvrir le War Room" ou "Afficher le tableau de bord".',
      de: 'Hyperion unterstützt vollständige Sprachsteuerung. Klicken Sie auf das Mikrofon und sagen Sie Befehle wie "Kriegsraum öffnen" oder "Dashboard anzeigen".',
      zh: 'Hyperion 支持完整的语音导航。点击麦克风图标，说出命令如"打开作战室"或"显示仪表板"。',
      ja: 'Hyperionは完全な音声ナビゲーションをサポートしています。マイクアイコンをクリックして、「ウォールームを開く」などのコマンドを話します。',
      ko: 'Hyperion은 전체 음성 탐색을 지원합니다. 마이크 아이콘을 클릭하고 "War Room 열기" 또는 "대시보드 표시"와 같은 명령을 말합니다.',
      ar: 'يدعم Hyperion التنقل الصوتي الكامل. انقر على أيقونة الميكروفون وقل أوامر مثل "فتح غرفة الحرب" أو "إظهار لوحة القيادة".',
      pt: 'Hyperion suporta navegação por voz completa. Clique no ícone do microfone e diga comandos como "Abrir War Room" ou "Mostrar painel".',
      ru: 'Hyperion поддерживает полную голосовую навигацию. Нажмите на значок микрофона и скажите команды, такие как "Открыть командный центр".',
      hi: 'Hyperion पूर्ण वॉइस नेविगेशन का समर्थन करता है। माइक्रोफोन आइकन पर क्लिक करें और "War Room खोलें" जैसे कमांड कहें।',
      it: 'Hyperion supporta la navigazione vocale completa. Clicca sull\'icona del microfono e pronuncia comandi come "Apri War Room" o "Mostra dashboard".',
      nl: 'Hyperion ondersteunt volledige spraaknavigatie. Klik op het microfoonpictogram en zeg commando\'s zoals "Open War Room" of "Toon dashboard".',
    },
  },
  {
    keywords: ['csv', 'data', 'upload', 'dataset', 'load', 'sample'],
    category: 'features',
    response: {
      en: 'Hyperion analyzes CSV datasets with 8 telemetry columns: throughput, latency_ms, error_rate, cyber_alerts, energy_usage, supply_chain_index, financial_volatility, satellite_signal. Upload via the Intelligence view or click "Load Sample" in the War Room to use the built-in demo dataset with 150 engineered rows containing guaranteed anomalies.',
      es: 'Hyperion analiza datasets CSV con 8 columnas de telemetría. Cargue en la vista de Inteligencia o use "Cargar Muestra" para el dataset demo.',
      fr: 'Hyperion analyse des datasets CSV avec 8 colonnes de télémétrie. Téléchargez via la vue Intelligence ou utilisez "Charger l\'échantillon".',
      de: 'Hyperion analysiert CSV-Datensätze mit 8 Telemetriespalten. Laden Sie in der Ansicht "Nachrichten" hoch oder verwenden Sie "Beispiel laden".',
      zh: 'Hyperion 分析包含 8 个遥测列的 CSV 数据集。通过情报视图上传，或使用"加载样本"按钮。',
      ja: 'Hyperionは8つのテレメトリー列を持つCSVデータセットを分析します。インテリジェンスビューからアップロードするか、「サンプルを読み込む」を使用します。',
      ko: 'Hyperion은 8개의 텔레메트리 열이 있는 CSV 데이터 세트를 분석합니다. Intelligence 보기에서 업로드하거나 "샘플 로드"를 사용하세요.',
      ar: 'يقوم Hyperion بتحليل مجموعات بيانات CSV مع 8 أعمدة للقياس عن بعد. قم بالتحميل عبر عرض الاستخبارات أو استخدم "تحميل عينة".',
      pt: 'Hyperion analisa datasets CSV com 8 colunas de telemetria. Faça upload na visão Inteligência ou use "Carregar Amostra".',
      ru: 'Hyperion анализирует CSV-наборы данных с 8 телеметрическими колонками. Загрузите через вид «Разведка» или используйте «Загрузить образец».',
      hi: 'Hyperion 8 टेलीमेट्री कॉलम वाले CSV डेटासेट का विश्लेषण करता है। Intelligence व्यू से अपलोड करें या "सैंपल लोड करें" का उपयोग करें।',
      it: 'Hyperion analizza dataset CSV con 8 colonne di telemetria. Carica tramite la vista Intelligence o usa "Carica campione".',
      nl: 'Hyperion analyseert CSV-datasets met 8 telemetriekolommen. Upload via de Intelligence-weergave of gebruik "Voorbeeld laden".',
    },
  },
  {
    keywords: ['ticket', 'orchestrator', 'support', 'resolution', 'customer'],
    category: 'features',
    response: {
      en: 'The Ticket Orchestrator resolves support tickets autonomously. Submit a ticket with subject and description. The system uses 4 agents: Ticket Analyzer (extracts intent), Knowledge Searcher (finds solutions), Database Operator (updates records), and Resolution Composer (writes the response). It searches a knowledge base of 10+ categories. Try it under the Tickets view.',
      es: 'El Orquestador de Tickets resuelve tickets de soporte autónomamente. Use 4 agentes para analizar, buscar, actualizar y componer la respuesta.',
      fr: 'L\'Orchestrateur de Tickets résout les tickets de support de manière autonome. Utilise 4 agents pour analyser, rechercher, mettre à jour et composer la réponse.',
      de: 'Der Ticket-Orchestrator löst Support-Tickets autonom. Verwendet 4 Agenten zum Analysieren, Suchen, Aktualisieren und Verfassen der Antwort.',
      zh: '工单编排器自动解决支持工单。使用 4 个代理进行分析、搜索、更新和撰写回复。',
      ja: 'チケットオーケストレーターはサポートチケットを自律的に解決します。4つのエージェントを使用して分析、検索、更新、応答作成を行います。',
      ko: 'Ticket Orchestrator는 지원 티켓을 자율적으로 해결합니다. 4개의 에이전트를 사용하여 분석, 검색, 업데이트 및 응답을 작성합니다.',
      ar: 'منسق التذاكر يحل تذاكر الدعم بشكل مستقل. يستخدم 4 وكلاء للتحليل والبحث والتحديث وتأليف الرد.',
      pt: 'O Orquestrador de Tickets resolve tickets de suporte autonomamente. Usa 4 agentes para analisar, pesquisar, atualizar e compor a resposta.',
      ru: 'Оркестратор тикетов автономно решает тикеты поддержки. Использует 4 агентов для анализа, поиска, обновления и составления ответа.',
      hi: 'टिकट ऑर्केस्ट्रेटर स्वायत्त रूप से सहायता टिकट हल करता है। विश्लेषण, खोज, अद्यतन और प्रतिक्रिया तैयार करने के लिए 4 एजेंटों का उपयोग करता है।',
      it: 'L\'Orchestratore di Ticket risolve i ticket di supporto in modo autonomo. Utilizza 4 agenti per analizzare, cercare, aggiornare e comporre la risposta.',
      nl: 'De Ticket Orchestrator lost ondersteuningstickets autonoom op. Gebruikt 4 agents om te analyseren, zoeken, updaten en het antwoord samen te stellen.',
    },
  },
  {
    keywords: ['code', 'agent', 'generate', 'refactor', 'bug', 'fix'],
    category: 'features',
    response: {
      en: 'The Code Agent generates JavaScript functions from natural language prompts. It runs a self-correction loop: generate code → validate syntax → execute 5 test cases → parse errors → refactor → retest (up to 3 attempts). It handles off-by-one errors, empty loop bodies, loose comparisons, and undefined variables. Try it under the Code AI view with prompts like "Fibonacci sequence" or "Palindrome checker".',
      es: 'El Agente de Código genera funciones JavaScript desde prompts. Ejecuta un bucle de autocorrección con hasta 3 intentos. ¡Pruébelo!',
      fr: 'L\'Agent de Code génère des fonctions JavaScript à partir de prompts. Il exécute une boucle d\'autocorrection avec jusqu\'à 3 tentatives. Essayez-le !',
      de: 'Der Code-Agent generiert JavaScript-Funktionen aus Prompts. Er führt eine Selbstkorrekturschleife mit bis zu 3 Versuchen aus. Probieren Sie es aus!',
      zh: '代码代理从自然语言提示生成 JavaScript 函数。它运行自纠正循环，最多 3 次尝试。试试看！',
      ja: 'コードエージェントは自然言語プロンプトからJavaScript関数を生成します。最大3回の試行で自己修正ループを実行します。',
      ko: '코드 에이전트는 자연어 프롬프트에서 JavaScript 함수를 생성합니다. 최대 3회 시도로 자체 수정 루프를 실행합니다.',
      ar: 'وكيل الكود يولد دوال JavaScript من الأوامر النصية. يقوم بتشغيل حلقة تصحيح ذاتي تصل إلى 3 محاولات. جربه!',
      pt: 'O Agente de Código gera funções JavaScript a partir de prompts. Executa um loop de autocorreção com até 3 tentativas. Experimente!',
      ru: 'Кодовый агент генерирует JavaScript-функции из текстовых запросов. Запускает цикл самокоррекции до 3 попыток. Попробуйте!',
      hi: 'कोड एजेंट प्राकृतिक भाषा प्रॉम्प्ट से JavaScript फ़ंक्शन उत्पन्न करता है। यह 3 प्रयासों तक स्व-सुधार लूप चलाता है।',
      it: 'L\'Agente di Codice genera funzioni JavaScript da prompt. Esegue un ciclo di autocorrezione con fino a 3 tentativi. Provalo!',
      nl: 'De Code Agent genereert JavaScript-functies vanuit natuurlijke taalprompts. Het voert een zelfcorrigerende lus uit met maximaal 3 pogingen. Probeer het!',
    },
  },
  {
    keywords: ['particle', 'background', 'visual', 'theme', 'design'],
    category: 'platform',
    response: {
      en: 'Hyperion features a cinematic dark theme with a particle field background (80-100 drifting stars with connection lines), a scanning line animation during analysis, glass-morphism panels, and gradient accents. The aesthetic is inspired by Palantir and sci-fi command centers. The Unsplash hero background shows Earth from orbit with command center overlays.',
      es: 'Hyperion tiene un tema oscuro cinematográfico con campo de partículas, línea de escaneo, paneles de vidrio y acentos degradados.',
      fr: 'Hyperion propose un thème sombre cinématographique avec un champ de particules, une ligne de balayage, des panneaux en verre et des accents dégradés.',
      de: 'Hyperion bietet ein cineastisches dunkles Thema mit Partikelfeld, Scanlinie, Glaspaneelen und Farbverlaufsakzenten.',
      zh: 'Hyperion 具有电影般的深色主题，带有粒子场、扫描线、玻璃面板和渐变色调。',
      ja: 'Hyperionは、パーティクルフィールド、スキャンライン、ガラスパネル、グラデーションアクセントを備えた映画的なダークテーマを特徴としています。',
      ko: 'Hyperion은 입자 필드, 스캔 라인, 유리 패널 및 그라데이션 악센트가 있는 영화 같은 다크 테마를 특징으로 합니다.',
      ar: 'يتميز Hyperion بمظهر داكن سينمائي مع حقل جسيمات وخط مسح وألواح زجاجية ولمسات متدرجة.',
      pt: 'Hyperion possui um tema escuro cinematográfico com campo de partículas, linha de varredura, painéis de vidro e acentos gradientes.',
      ru: 'Hyperion имеет кинематографическую тёмную тему с полем частиц, линией сканирования, стеклянными панелями и градиентными акцентами.',
      hi: 'Hyperion में कण क्षेत्र, स्कैनिंग लाइन, ग्लास पैनल और ग्रेडिएंट एक्सेंट के साथ एक सिनेमाई डार्क थीम है।',
      it: 'Hyperion presenta un tema scuro cinematografico con campo di particelle, linea di scansione, pannelli in vetro e accenti sfumati.',
      nl: 'Hyperion heeft een cinematografisch donker thema met een deeltjesveld, scanlijn, glazen panelen en gradiëntaccenten.',
    },
  },
  {
    keywords: ['pipeline', 'analysis', 'run', 'deploy', 'process'],
    category: 'platform',
    response: {
      en: 'The analysis pipeline runs 4 phases sequentially: 1) Scout scans for anomalies (~2.2s), 2) Strategist models scenarios (~2.5s), 3) Tactical plans mitigations (~2.9s), 4) Commander approves and logs (~3.5s). Total runtime is approximately 11 seconds. Each phase is visualized in the React Flow graph with animated edges and pulsing nodes. Results persist until you start a new session.',
      es: 'El pipeline de análisis ejecuta 4 fases secuenciales en aproximadamente 11 segundos. Cada fase se visualiza en el grafo con bordes animados.',
      fr: 'Le pipeline d\'analyse exécute 4 phases séquentielles en environ 11 secondes. Chaque phase est visualisée avec des arêtes animées.',
      de: 'Die Analyse-Pipeline führt 4 Phasen sequentiell in etwa 11 Sekunden aus. Jede Phase wird mit animierten Kanten visualisiert.',
      zh: '分析管道按顺序执行 4 个阶段，大约需要 11 秒。每个阶段都用动画边缘可视化。',
      ja: '分析パイプラインは4つのフェーズを順次実行し、約11秒かかります。各フェーズはアニメーションエッジで視覚化されます。',
      ko: '분석 파이프라인은 약 11초 동안 4단계를 순차적으로 실행합니다. 각 단계는 애니메이션 가장자리로 시각화됩니다.',
      ar: 'خط أنابيب التحليل ينفذ 4 مراحل متتالية في حوالي 11 ثانية. كل مرحلة يتم تصورها بحواف متحركة.',
      pt: 'O pipeline de análise executa 4 fases sequencialmente em aproximadamente 11 segundos. Cada fase é visualizada com bordas animadas.',
      ru: 'Конвейер анализа выполняет 4 фазы последовательно примерно за 11 секунд. Каждая фаза визуализируется анимированными рёбрами.',
      hi: 'विश्लेषण पाइपलाइन लगभग 11 सेकंड में क्रमिक रूप से 4 चरणों को निष्पादित करती है। प्रत्येक चरण एनिमेटेड किनारों के साथ विज़ुअलाइज़ किया जाता है।',
      it: 'La pipeline di analisi esegue 4 fasi in sequenza in circa 11 secondi. Ogni fase è visualizzata con bordi animati.',
      nl: 'De analysepipeline voert 4 fasen opeenvolgend uit in ongeveer 11 seconden. Elke fase wordt gevisualiseerd met geanimeerde randen.',
    },
  },
  {
    keywords: ['sms', 'alert', 'webhook', 'notification', 'send'],
    category: 'features',
    response: {
      en: 'Hyperion can send alerts via webhook (configurable via NEXT_PUBLIC_WEBHOOK_URL). After analysis completes, click "Send Alert" in the mission complete banner to POST a JSON summary to your endpoint. The payload includes anomaly count, scenario count, mitigation count, and total financial exposure. You can also configure Twilio for SMS delivery.',
      es: 'Hyperion puede enviar alertas vía webhook. Haga clic en "Enviar Alerta" para enviar un resumen JSON. Se puede configurar Twilio para SMS.',
      fr: 'Hyperion peut envoyer des alertes via webhook. Cliquez sur "Envoyer l\'alerte" pour envoyer un résumé JSON. Twilio peut être configuré pour SMS.',
      de: 'Hyperion kann Warnungen per Webhook senden. Klicken Sie auf "Alert senden", um eine JSON-Zusammenfassung zu senden. Twilio kann für SMS konfiguriert werden.',
      zh: 'Hyperion 可以通过 webhook 发送警报。点击"发送警报"发送 JSON 摘要。可以配置 Twilio 用于 SMS。',
      ja: 'Hyperionはwebhookを介してアラートを送信できます。「アラートを送信」をクリックしてJSONサマリーを送信します。SMS用にTwilioを設定できます。',
      ko: 'Hyperion은 웹훅을 통해 알림을 보낼 수 있습니다. "알림 보내기"를 클릭하여 JSON 요약을 보냅니다. SMS용 Twilio를 구성할 수 있습니다.',
      ar: 'يمكن لـ Hyperion إرسال التنبيهات عبر webhook. انقر على "إرسال تنبيه" لإرسال ملخص JSON. يمكن تكوين Twilio للرسائل النصية.',
      pt: 'Hyperion pode enviar alertas via webhook. Clique em "Enviar Alerta" para enviar um resumo JSON. O Twilio pode ser configurado para SMS.',
      ru: 'Hyperion может отправлять оповещения через вебхук. Нажмите «Отправить оповещение», чтобы отправить JSON-сводку. Twilio можно настроить для SMS.',
      hi: 'Hyperion वेबहुक के माध्यम से अलर्ट भेज सकता है। JSON सारांश भेजने के लिए "अलर्ट भेजें" पर क्लिक करें। SMS के लिए Twilio कॉन्फ़िगर किया जा सकता है।',
      it: 'Hyperion può inviare avvisi via webhook. Clicca su "Invia avviso" per inviare un riepilogo JSON. Twilio può essere configurato per SMS.',
      nl: 'Hyperion kan waarschuwingen verzenden via webhook. Klik op "Waarschuwing verzenden" om een JSON-samenvatting te verzenden. Twilio kan worden geconfigureerd voor SMS.',
    },
  },
  {
    keywords: ['tts', 'text to speech', 'speak', 'audio', 'read'],
    category: 'features',
    response: {
      en: 'Hyperion uses the Web Speech API for Text-to-Speech. It speaks: analysis completion, ticket resolution completion, code agent results, voice command confirmations, and status reports. Speech is available in the browser\'s default language. Click the mic icon to see the voice HUD with waveform animation. You can also say "Status report" to hear a spoken situation report.',
      es: 'Hyperion usa la API Web Speech para texto a voz. Habla confirmaciones, resultados y reportes. Diga "Informe de estado" para un reporte hablado.',
      fr: 'Hyperion utilise l\'API Web Speech pour la synthèse vocale. Il parle les confirmations, résultats et rapports. Dites "Rapport d\'état".',
      de: 'Hyperion verwendet die Web Speech API für Text-to-Speech. Es spricht Bestätigungen, Ergebnisse und Berichte. Sagen Sie "Statusbericht".',
      zh: 'Hyperion 使用 Web Speech API 进行文本转语音。它会说出确认、结果和报告。说"状态报告"。',
      ja: 'HyperionはText-to-SpeechにWeb Speech APIを使用します。確認、結果、レポートを読み上げます。「ステータスレポート」と言ってください。',
      ko: 'Hyperion은 TTS에 Web Speech API를 사용합니다. 확인, 결과 및 보고서를 말합니다. "상태 보고서"라고 말하세요.',
      ar: 'يستخدم Hyperion Web Speech API لتحويل النص إلى كلام. يتحدث التأكيدات والنتائج والتقارير. قل "تقرير الحالة".',
      pt: 'Hyperion usa a Web Speech API para texto em fala. Fala confirmações, resultados e relatórios. Diga "Relatório de status".',
      ru: 'Hyperion использует Web Speech API для синтеза речи. Он произносит подтверждения, результаты и отчёты. Скажите «Отчёт о состоянии».',
      hi: 'Hyperion टेक्स्ट-टू-स्पीच के लिए Web Speech API का उपयोग करता है। यह पुष्टिकरण, परिणाम और रिपोर्ट बोलता है। "स्टेटस रिपोर्ट" कहें।',
      it: 'Hyperion utilizza l\'API Web Speech per il text-to-speech. Parla conferme, risultati e rapporti. Dì "Rapporto sullo stato".',
      nl: 'Hyperion gebruikt de Web Speech API voor text-to-speech. Het spreekt bevestigingen, resultaten en rapporten. Zeg "Statusrapport".',
    },
  },
  {
    keywords: ['help', 'what can you do', 'capabilities', 'features', 'how to'],
    category: 'general',
    response: {
      en: 'I can help you with: \n• Explaining Hyperion\'s 4 agents (Scout, Strategist, Tactical, Commander)\n• Navigating views (War Room, Intelligence, Threats, Tickets, Code AI)\n• Voice commands and TTS\n• CSV data upload and analysis pipeline\n• Ticket orchestration for support resolution\n• Code generation with self-correction\n• Webhook/SMS alerts\n• Platform design and theme\n\nTry asking me about any specific feature!',
      es: 'Puedo ayudarte con: explicar agentes, navegar vistas, comandos de voz, carga de datos, tickets, código, alertas y diseño.',
      fr: 'Je peux vous aider avec : expliquer les agents, naviguer les vues, commandes vocales, chargement de données, tickets, code, alertes et design.',
      de: 'Ich kann helfen mit: Agenten erklären, Ansichten navigieren, Sprachbefehle, Datenupload, Tickets, Code, Warnungen und Design.',
      zh: '我可以帮助你：解释代理、导航视图、语音命令、数据上传、工单、代码、警报和设计。',
      ja: 'エージェントの説明、ビューのナビゲーション、音声コマンド、データアップロード、チケット、コード、アラート、デザインについて支援できます。',
      ko: '에이전트 설명, 보기 탐색, 음성 명령, 데이터 업로드, 티켓, 코드, 알림 및 디자인에 대해 도움을 드릴 수 있습니다.',
      ar: 'يمكنني مساعدتك في: شرح الوكلاء، التنقل في المشاهدات، الأوامر الصوتية، تحميل البيانات، التذاكر، الكود، التنبيهات والتصميم.',
      pt: 'Posso ajudar com: explicar agentes, navegar nas visualizações, comandos de voz, upload de dados, tickets, código, alertas e design.',
      ru: 'Я могу помочь с: объяснением агентов, навигацией по видам, голосовыми командами, загрузкой данных, тикетами, кодом, оповещениями и дизайном.',
      hi: 'मैं इसमें मदद कर सकता हूं: एजेंटों की व्याख्या, दृश्यों को नेविगेट करना, वॉइस कमांड, डेटा अपलोड, टिकट, कोड, अलर्ट और डिज़ाइन।',
      it: 'Posso aiutarti con: spiegare gli agenti, navigare le viste, comandi vocali, caricamento dati, ticket, codice, avvisi e design.',
      nl: 'Ik kan helpen met: agenten uitleggen, weergaven navigeren, spraakopdrachten, data uploaden, tickets, code, waarschuwingen en ontwerp.',
    },
  },
];

// ─── Intent Matching ───

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function scoreMatch(text: string, entry: KBEntry): number {
  const normal = normalize(text);
  const words = normal.split(' ');
  let score = 0;

  for (const kw of entry.keywords) {
    const kwNorm = normalize(kw);
    if (normal.includes(kwNorm)) {
      score += 10;
    } else {
      const kwWords = kwNorm.split(' ');
      const matchCount = kwWords.filter((w) => words.some((uw) => uw.includes(w) || w.includes(uw))).length;
      score += matchCount * 3;
    }
  }

  return score;
}

export function findBestResponse(text: string, lang: SupportedLang): string {
  const normal = normalize(text);

  // Check for fallback patterns
  const fallbackWords = ['who are you', 'what is hyperion', 'what is this', 'tell me about yourself', 'introduce yourself', 'hello', 'hi', 'hey'];
  const isGreeting = fallbackWords.some((w) => normal.includes(w));

  if (isGreeting) {
    return getGreeting(lang);
  }

  let bestScore = 0;
  let bestEntry: KBEntry | null = null;

  for (const entry of KB) {
    const score = scoreMatch(text, entry);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && bestScore > 5) {
    return bestEntry.response[lang] || bestEntry.response.en;
  }

  // Fallback: try to get a general response
  const helpEntry = KB.find((e) => e.keywords.includes('help'));
  return helpEntry
    ? (helpEntry.response[lang] || helpEntry.response.en)
    : getGreeting(lang);
}

// ─── Chat Types ───

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function createMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, role, content, timestamp: Date.now() };
}
