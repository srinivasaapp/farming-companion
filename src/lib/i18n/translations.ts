export type Language = 'en' | 'te';

export const translations = {
    en: {
        // Navigation
        nav_learn: 'Learn',
        nav_stories: 'Stories',
        nav_home: 'Home',
        nav_ask: 'Ask',
        nav_market: 'Market',
        nav_profile: 'Profile',

        // Auth / Profile
        profile_welcome: 'Welcome Back',
        profile_login: 'Login',
        profile_signup: 'Sign Up',
        profile_logout: 'Logout',
        profile_farmer: 'Farmer',
        profile_expert: 'Verified Expert',
        profile_impact: 'Your Impact',
        profile_questions: 'Questions',
        profile_answers: 'Answers',
        profile_listings: 'Listings',
        profile_trust_score: 'Trust Score',
        profile_identity: 'Identity & Skills',
        profile_member_since: 'Joined',
        profile_show_contact: 'Show Contact',
        profile_my_posts: 'My Posts',
        profile_my_listings: 'My Listings',
        profile_settings: 'Settings',
        profile_help: 'Help & Support',

        // Guest
        welcome_guest: 'Welcome, Guest!',
        guest_desc: 'Log in to access your profile and farming tools.',
        login_btn: 'Login',

        // Settings & Legal
        settings_edit_profile: 'Edit Profile',
        settings_account: 'Account',
        settings_tools: 'App Tools',
        settings_support: 'Support',
        settings_legal: 'Legal / Info',
        settings_saved_posts: 'Saved Posts',
        settings_activity_history: 'Activity History',
        settings_drafts: 'Drafts',
        settings_privacy_policy: 'Privacy Policy',
        settings_terms_of_service: 'Terms of Service',
        settings_community_guidelines: 'Community Guidelines',
        settings_help_center: 'Help Center',
        settings_copyright: 'Copyright & Info',
        settings_edit_photo: 'Change Photo',
        settings_username_notice: 'Username can only be changed once.',

        // Community / Ask
        ask_title: 'Community',
        ask_button: 'Ask Question',
        ask_search_placeholder: 'Search questions, crops, or problems...',
        ask_solved: 'Solved',
        ask_unsolved: 'Unsolved',

        // Market
        market_title: 'Marketplace',
        market_post_listing: 'Post Listing',
        market_tab_buy: 'Buy',
        market_tab_sell: 'Sell',
        market_tab_rent: 'Rent',
        market_verified_only: 'Verified Only',
        market_near_me: 'Near Me',
        market_filters: 'Filters',
        market_chat: 'Chat',
        market_call: 'Call',

        // Generic
        generic_loading: 'Loading...',
        generic_error_title: 'Something went wrong',
        generic_retry: 'Retry',
        generic_back: 'Back',
        generic_save: 'Save',
        generic_cancel: 'Cancel',

        // New Keys
        ask_search_no_results: 'No questions found.',
        market_no_results: 'No items found in this category.',
        ask_title_label: 'Title',
        ask_title_placeholder: 'What is your question?',
        ask_desc_label: 'Description',
        ask_desc_placeholder: 'Provide more details...',
        ask_crop_label: 'Crop Type',
        ask_crop_placeholder: 'e.g. Rice, Wheat, Cotton',
        market_item_title: 'Item Title',
        market_price: 'Price (₹)',
        market_unit: 'Unit',
        market_location: 'Location',
        market_category: 'Category',
        market_desc_label: 'Description',

        // Dashboard & Widgets
        highlights_title: 'Highlights',
        tip_of_day_title: 'Tip of the Day',
        tip_of_day_desc: 'Natural pest control using Neem oil',
        market_trend_title: 'Market Trend',
        market_trend_desc: 'Cotton prices stable at ₹6,200',
        stories_planting_tips: 'Planting Tips',
        stories_harvest_guide: 'Harvest Guide',
        stories_view_all: 'View All Stories',
        stories_new_badge: 'New',

        // Dashboard Greetings
        greeting_morning: 'Good Morning',
        greeting_afternoon: 'Good Afternoon',
        greeting_evening: 'Good Evening',
        dashboard_welcome_subtitle: 'Ready to grow something great today?',

        // Account Menu
        menu_my_activity: 'My Activity',
        menu_saved_items: 'Saved Items',
        menu_notifications: 'Notifications',
        menu_privacy_policy: 'Privacy Policy',
        menu_terms: 'Terms & Conditions',
        menu_help_support: 'Help & Support',
        menu_report_issue: 'Report Issue',

        // Stories
        stories_tab_expert: 'EXPERT',
        stories_tab_user: 'USER',
        story_action_useful: 'Useful',
        story_action_chat: 'Chat',
        story_action_share: 'Share',
        story_badge_expert: 'Expert',

        // Auth Screens
        auth_title_login: 'Welcome Back',
        auth_subtitle_login: 'Login to your account',
        auth_title_signup: 'Create Account',
        auth_subtitle_signup: 'Join the farmers community',
        auth_email: 'Email',
        auth_password: 'Password',
        auth_confirm_password: 'Confirm Password',
        auth_username: 'Username',
        auth_username_hint: '(Unique)',
        auth_phone: 'Phone',
        auth_phone_hint: '(Optional)',
        auth_btn_login: 'Login',
        auth_btn_signup: 'Sign Up',
        auth_btn_logging_in: 'Logging in...',
        auth_btn_signing_up: 'Signing up...',
        auth_switch_to_signup: 'New here? Create Account',
        auth_switch_to_login: 'Already have an account? Login',
        auth_terms: 'By continuing, you agree to our Terms & Privacy Policy',
        auth_verify_title: 'Verify Email',
        auth_verify_sent: 'We sent a verification link to',
        auth_verify_instructions: 'Please check your inbox and click the link to activate your account. Once verified, you can log in.',
        auth_back_to_login: 'Back to Login',

        // Learn Section
        learn_action_helpful: 'Helpful',
        learn_helpful_count: 'found this helpful',

        // Create Menu
        create_menu_ask: 'Ask Question',
        create_menu_post: 'Post to Community',
        create_menu_poll: 'Create Poll',
        create_menu_photo: 'Upload Photo',
        create_menu_voice: 'Voice Post',
        create_menu_answer: 'Answer Questions',
        create_menu_advisory: 'Expert Advisory',
        create_menu_knowledge: 'Knowledge Tip',
        create_menu_voice_advisory: 'Voice Advisory',

        // Comments
        comment_placeholder: 'Write a comment...',
        comment_recording: 'Recording...',
        comment_reply: 'Reply',
        comment_like: 'Like',
        comment_send: 'Send',
        comment_voice_note: 'Voice Note',
        comment_view_replies: 'View Replies',
        comment_hide_replies: 'Hide Replies',

        // Weather Widget
        weather_suggest_location: 'Select Location',
        weather_use_current: 'Use My Current Location',
        weather_set_location: 'Set Location',
        weather_search_placeholder: 'Enter City or Pincode (e.g. 500001)',
        weather_searching: 'Searching...',
        weather_no_results: 'No results found',
        weather_sunny: 'Sunny',
        weather_cloudy: 'Cloudy',
        weather_foggy: 'Foggy',
        weather_rainy: 'Rainy',
        weather_snow: 'Snow',
        weather_stormy: 'Stormy',
        weather_unknown: 'Unknown',
        weather_loading: 'Weather...',

        // Global Search
        search_placeholder: 'Search for crops, pests, market prices...',
        search_app_results: 'App Results',
        search_global_option: 'Search Web',
        search_global_desc: 'Find external resources, images, and guides',
        search_no_app_results: 'No results found in app.',
        search_min_chars: 'Type at least 2 characters to search across the app.',

        // Home Page
        home_mandi_update: 'Mandi Update',
        home_footer_copyright: 'copyright 2026 @ keypaper.in',


    },
    te: {
        // Navigation
        nav_learn: 'నేర్చుకోండి',
        nav_stories: 'కథలు',
        nav_home: 'హోమ్',
        nav_ask: 'అడగండి',
        nav_market: 'మార్కెట్',
        nav_profile: 'ప్రొఫైల్',

        // Auth / Profile
        profile_welcome: 'తిరిగి స్వాగతం',
        profile_login: 'లాగిన్',
        profile_signup: 'సైన్ అప్',
        profile_logout: 'లాగ్ అవుట్',
        profile_farmer: 'రైతు',
        profile_expert: 'ధృవీకరించబడిన నిపుణుడు',
        profile_impact: 'మీ ప్రభావం',
        profile_questions: 'ప్రశ్నలు',
        profile_answers: 'సమాధానాలు',
        profile_listings: 'జాబితాలు',
        profile_trust_score: 'నమ్మక స్కోరు',
        profile_identity: 'గుర్తింపు & నైపుణ్యాలు',
        profile_member_since: 'చేరారు',
        profile_show_contact: 'కాంటాక్ట్ చూపండి',
        profile_my_posts: 'నా పోస్ట్‌లు',
        profile_my_listings: 'నా జాబితాలు',
        profile_settings: 'సెట్టింగ్‌లు',
        profile_help: 'సహాయం & మద్దతు',

        // Guest
        welcome_guest: 'స్వాగతం!',
        guest_desc: 'మీ ప్రొఫైల్ మరియు వ్యవసాయ సాధనాలను యాక్సెస్ చేయడానికి లాగిన్ చేయండి.',
        login_btn: 'లాగిన్',

        // Community / Ask
        ask_title: 'కమ్యూనిటీ',
        ask_button: 'ప్రశ్న అడగండి',
        ask_search_placeholder: 'ప్రశ్నలు, పంటలు లేదా సమస్యల కోసం వెతకండి...',
        ask_solved: 'పరిష్కరించబడింది',
        ask_unsolved: 'పరిష్కరించబడలేదు',

        // Market
        market_title: 'మార్కెట్‌ప్లేస్',
        market_post_listing: 'లిస్టింగ్ పోస్ట్ చేయండి',
        market_tab_buy: 'కొనండి',
        market_tab_sell: 'అమ్మండి',
        market_tab_rent: 'అద్దెకు',
        market_verified_only: 'ధృవీకరించబడినవి మాత్రమే',
        market_near_me: 'నాకు దగ్గరలో',
        market_filters: 'ఫిల్టర్లు',
        market_chat: 'చాట్',
        market_call: 'కాల్',

        // Generic
        generic_loading: 'లోడ్ అవుతోంది...',
        generic_error_title: 'ఏదో తప్పు జరిగింది',
        generic_retry: 'మళ్ళీ ప్రయత్నించండి',
        generic_back: 'వెనక్కి',
        generic_save: 'సేవ్ చేయండి',
        generic_cancel: 'రద్దు చేయండి',

        // Settings & Legal
        settings_edit_profile: 'ప్రొఫైల్ సవరించండి',
        settings_account: 'ఖాతా',
        settings_tools: 'అప్లికేషన్ టూల్స్',
        settings_support: 'మద్దతు',
        settings_legal: 'చట్టపరమైన సమాచారం',
        settings_saved_posts: 'సేవ్ చేసిన పోస్ట్‌లు',
        settings_activity_history: 'కార్యకలాపాల చరిత్ర',
        settings_drafts: 'డ్రాఫ్ట్‌లు',
        settings_privacy_policy: 'గోప్యతా విధానం',
        settings_terms_of_service: 'సేవా నిబంధనలు',
        settings_community_guidelines: 'కమ్యూనిటీ మార్గదర్శకాలు',
        settings_help_center: 'సహాయ కేంద్రం',
        settings_copyright: 'కాపీరైట్ & సమాచారం',
        settings_edit_photo: 'ఫోటో మార్చండి',
        settings_username_notice: 'వినియోగదారు పేరు ఒకసారి మాత్రమే మార్చవచ్చు.',

        // New Keys
        ask_search_no_results: 'ఏ ప్రశ్నలు కనుగొనబడలేదు.',
        market_no_results: 'ఈ విభాగంలో వస్తువులు ఏవీ లేవు.',
        ask_title_label: 'శీర్షిక',
        ask_title_placeholder: 'మీ ప్రశ్న ఏమిటి?',
        ask_desc_label: 'వివరణ',
        ask_desc_placeholder: 'మరిన్ని వివరాలను అందించండి...',
        ask_crop_label: 'పంట రకం',
        ask_crop_placeholder: 'ఉదా. వరి, గోధుమ, పత్తి',
        market_item_title: 'వస్తువు శీర్షిక',
        market_price: 'ధర (₹)',
        market_unit: 'యూనిట్',
        market_location: 'స్థలం',
        market_category: 'వర్గం',
        market_desc_label: 'వివరణ',

        // Dashboard & Widgets
        highlights_title: 'ముఖ్యాంశాలు',
        tip_of_day_title: 'ఈ రోజు చిట్కా',
        tip_of_day_desc: 'వేప నూనె ఉపయోగించి సహజ తెగులు నియంత్రణ',
        market_trend_title: 'మార్కెట్ సరళి',
        market_trend_desc: 'పత్తి ధరలు ₹6,200 వద్ద నిలకడగా ఉన్నాయి',
        stories_planting_tips: 'నాటడం చిట్కాలు',
        stories_harvest_guide: 'కోత మార్గదర్శి',
        stories_view_all: 'అన్ని కథలను వీక్షించండి',
        stories_new_badge: 'కొత్తది',

        // Dashboard Greetings
        greeting_morning: 'శుభోదయం',
        greeting_afternoon: 'శుభ మధ్యాహ్నం',
        greeting_evening: 'శుభ సాయంత్రం',
        dashboard_welcome_subtitle: 'ఈ రోజు గొప్పగా ఏదైనా పండించడానికి సిద్ధంగా ఉన్నారా?',

        // Account Menu
        menu_my_activity: 'నా కార్యకలాపాలు',
        menu_saved_items: 'సేవ్ చేసిన అంశాలు',
        menu_notifications: 'నోటిఫికేషన్లు',
        menu_privacy_policy: 'గోప్యతా విధానం',
        menu_terms: 'నిబంధనలు & షరతులు',
        menu_help_support: 'సహాయం & మద్దతు',
        menu_report_issue: 'సమస్యను నివేదించండి',

        // Stories
        stories_tab_expert: 'నిపుణులు',
        stories_tab_user: 'రైతులు',
        story_action_useful: 'ఉపయోగకరమైనది',
        story_action_chat: 'చాట్',
        story_action_share: 'షేర్',
        story_badge_expert: 'నిపుణుడు',

        // Auth Screens
        auth_title_login: 'తిరిగి స్వాగతం',
        auth_subtitle_login: 'మీ ఖాతాలోకి లాగిన్ అవ్వండి',
        auth_title_signup: 'ఖాతాను సృష్టించండి',
        auth_subtitle_signup: 'రైతుల సంఘంలో చేరండి',
        auth_email: 'ఇమెయిల్',
        auth_password: 'పాస్‌వర్డ్',
        auth_confirm_password: 'పాస్‌వర్డ్ నిర్ధారించండి',
        auth_username: 'వినియోగదారు పేరు',
        auth_username_hint: '(ప్రత్యేకమైన)',
        auth_phone: 'ఫోన్',
        auth_phone_hint: '(ఐచ్ఛికం)',
        auth_btn_login: 'లాగిన్',
        auth_btn_signup: 'సైన్ అప్',
        auth_btn_logging_in: 'లాగిన్ అవుతోంది...',
        auth_btn_signing_up: 'సైన్ అప్ అవుతోంది...',
        auth_switch_to_signup: 'కొత్తవారా? ఖాతాను సృష్టించండి',
        auth_switch_to_login: 'ఖాతా ఉందా? లాగిన్ చేయండి',
        auth_terms: 'ముందుకెళ్లడం ద్వారా, మీరు మా నిబంధనలు & గోప్యతా విధానానికి అంగీకరిస్తున్నారు',
        auth_verify_title: 'ఇమెయిల్ ధృవీకరించండి',
        auth_verify_sent: 'ధృవీకరణ లింక్‌ను దీనికి పంపాము:',
        auth_verify_instructions: 'దయచేసి మీ ఇన్‌బాక్స్‌ని తనిఖీ చేసి, ఖాతాను సక్రియం చేయడానికి లింక్‌పై క్లిక్ చేయండి. ధృవీకరించిన తర్వాత, మీరు లాగిన్ చేయవచ్చు.',
        auth_back_to_login: 'తిరిగి లాగిన్ కు వెళ్ళండి',

        // Learn Section
        learn_action_helpful: 'ఉపయోగకరమైనది',
        learn_helpful_count: 'మందికి ఇది ఉపయోగపడింది',

        // Create Menu
        create_menu_ask: 'ప్రశ్న అడగండి',
        create_menu_post: 'కమ్యూనిటీలో పోస్ట్ చేయండి',
        create_menu_poll: 'పోల్ సృష్టించండి',
        create_menu_photo: 'ఫోటో అప్‌లోడ్ చేయండి',
        create_menu_voice: 'వాయిస్ పోస్ట్',
        create_menu_answer: 'ప్రశ్నలకు సమాధానం ఇవ్వండి',
        create_menu_advisory: 'నిపుణుల సలహా',
        create_menu_knowledge: 'జ్ఞాన చిట్కా',
        create_menu_voice_advisory: 'వాయిస్ సలహా',

        // Comments
        comment_placeholder: 'కామెంట్ రాయండి...',
        comment_recording: 'రికార్డింగ్...',
        comment_reply: 'సమాధానం',
        comment_like: 'లైక్',
        comment_send: 'పంపు',
        comment_voice_note: 'వాయిస్ నోట్',
        comment_view_replies: 'సమాధానాలు చూడండి',
        comment_hide_replies: 'సమాధానాలు దాచండి',

        // Weather Widget
        weather_suggest_location: 'స్థలం ఎంచుకోండి',
        weather_use_current: 'నా ప్రస్తుత స్థానాన్ని ఉపయోగించండి',
        weather_set_location: 'స్థానాన్ని సెట్ చేయండి',
        weather_search_placeholder: 'నగరం లేదా పిన్‌కోడ్ నమోదు చేయండి (ఉదా. 500001)',
        weather_searching: 'వెతుకుతోంది...',
        weather_no_results: 'ఫలితాలు కనుగొనబడలేదు',
        weather_sunny: 'ఎండగా',
        weather_cloudy: 'మేఘావృతం',
        weather_foggy: 'పొగమంచు',
        weather_rainy: 'వర్షం',
        weather_snow: 'మంచు',
        weather_stormy: 'తుఫాను',
        weather_unknown: 'తెలియదు',
        weather_loading: 'వాతావరణం...',

        // Global Search
        search_placeholder: 'పంటలు, తెగుళ్లు, మార్కెట్ ధరలు వెతకండి...',
        search_app_results: 'యాప్ ఫలితాలు',
        search_global_option: 'వెబ్‌లో వెతకండి',
        search_global_desc: 'బాహ్య వనరులు, చిత్రాలు మరియు మార్గదర్శకాలను కనుగొనండి',
        search_no_app_results: 'యాప్‌లో ఫలితాలు ఏవీ దొరకలేదు.',
        search_min_chars: 'యాప్‌లో వెతకడానికి కనీసం 2 అక్షరాలను టైప్ చేయండి.',

        // Home Page
        home_mandi_update: 'మండి సమాచారం',
        home_footer_copyright: 'కాపీరైట్ 2026 @ keypaper.in',


    }
};
