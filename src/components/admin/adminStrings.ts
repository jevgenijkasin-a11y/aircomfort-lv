export type Lang = 'ru' | 'en';
export type Section = 'requests' | 'products' | 'texts' | 'settings' | 'password';

export interface AdminRequest {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  status: string;
  created_at: string;
}

export interface AdminProduct {
  id: number;
  brand: string;
  name_lv: string;
  name_ru: string;
  name_en: string;
  category: 'home' | 'heat_pump' | 'commercial' | 'commercial_heat_pump';
  power_kw: number;
  area_coverage: string;
  price: number;
  install_price: number;
  energy_class: string;
  features: string[];
  features_lv?: string[] | string;
  features_ru?: string[] | string;
  features_en?: string[] | string;
  brand_color: string;
  image_url: string;
  image_urls: string[];
  in_stock: boolean;
  created_at?: string;
}

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  hours: string;
  whatsapp_number: string;
  telegram_username: string;
  hero_title_lv: string;
  hero_title_ru: string;
  hero_title_en: string;
  hero_subtitle_lv: string;
  hero_subtitle_ru: string;
  hero_subtitle_en: string;
  stat1_value: string;
  stat1_label_lv: string;
  stat1_label_ru: string;
  stat1_label_en: string;
  stat2_value: string;
  stat2_label_lv: string;
  stat2_label_ru: string;
  stat2_label_en: string;
  stat3_value: string;
  stat3_label_lv: string;
  stat3_label_ru: string;
  stat3_label_en: string;
  contacts_title_lv: string;
  contacts_title_ru: string;
  contacts_title_en: string;
  contacts_subtitle_lv: string;
  contacts_subtitle_ru: string;
  contacts_subtitle_en: string;
  contacts_form_title_lv: string;
  contacts_form_title_ru: string;
  contacts_form_title_en: string;
  install_price_from: string;
}

export const T = {
  ru: {
    adminTitle: 'Панель управления',
    navRequests: 'Заявки',
    navProducts: 'Товары',
    navSettings: 'Настройки',
    navPassword: 'Сменить пароль',
    navLogout: 'Выйти',
    loginTitle: 'Вход в панель',
    loginDesc: 'AirComfort Admin',
    passwordLabel: 'Пароль',
    loginBtn: 'Войти',
    loginLoading: 'Вход...',
    loginError: 'Неверный пароль',
    reqTitle: 'Заявки клиентов',
    reqEmpty: 'Заявок пока нет',
    reqEmptyDesc: 'Новые заявки с сайта появятся здесь',
    reqColName: 'Имя',
    reqColPhone: 'Телефон',
    reqColEmail: 'Email',
    reqColMsg: 'Сообщение',
    reqColDate: 'Дата',
    reqColService: 'Услуга',
    reqNew: 'Новая',
    reqRead: 'Прочитано',
    reqMarkRead: 'Отметить прочитанной',
    reqDelete: 'Удалить',
    reqFilterAll: 'Все',
    reqFilterNew: 'Новые',
    navTexts: 'Тексты сайта',
    textsTitle: 'Тексты сайта',
    textsHeroSection: 'Hero секция',
    textsServicesSection: 'Секция услуг',
    textsCatsSection: 'Секция категорий',
    textsSave: 'Сохранить тексты',
    textsSaved: 'Тексты сохранены!',
    textsTitleLv: 'Заголовок LV',
    textsTitleRu: 'Заголовок RU',
    textsTitleEn: 'Заголовок EN',
    textsSubtitleLv: 'Подзаголовок LV',
    textsSubtitleRu: 'Подзаголовок RU',
    textsSubtitleEn: 'Подзаголовок EN',
    textsNameLv: 'Название LV',
    textsNameRu: 'Название RU',
    textsNameEn: 'Название EN',
    textsDescLv: 'Описание LV',
    textsDescRu: 'Описание RU',
    textsDescEn: 'Описание EN',
    textsSupply: 'Поставка',
    textsInstall: 'Установка',
    textsMaint: 'Обслуживание',
    textsConsult: 'Консультация',
    textsCatHome: 'Домашние кондиционеры',
    textsCatHp: 'Тепловые насосы воздух-воздух',
    textsCatComm: 'Промышленные кондиционеры',
    textsCatIhp: 'Тепловые насосы воздух-вода',
    prodTitle: 'Управление товарами',
    prodAdd: 'Добавить товар',
    prodEdit: 'Редактировать',
    prodDelete: 'Удалить',
    prodSave: 'Сохранить',
    prodCancel: 'Отмена',
    prodAddTitle: 'Добавить товар',
    prodEditTitle: 'Редактировать товар',
    prodBrand: 'Бренд',
    prodNameLv: 'Название (LV)',
    prodNameRu: 'Название (RU)',
    prodNameEn: 'Название (EN)',
    prodCategory: 'Категория',
    prodCatHome: 'Домашние кондиционеры',
    prodCatHeatPump: 'Тепловые насосы воздух-воздух',
    prodCatCommercial: 'Промышленная климатизация',
    prodCatCommercialHeatPump: 'Тепловые насосы воздух-вода',
    prodPower: 'Мощность (кВт)',
    prodArea: 'Площадь (м², напр. 20–25)',
    prodPrice: 'Цена (EUR)',
    prodInstallPrice: 'Монтаж (EUR)',
    prodEnergyClass: 'Класс энергоэффективности',
    prodFeatures: 'Характеристики',
    prodFeaturesLv: 'Характеристики LV (через запятую)',
    prodFeaturesRu: 'Характеристики RU (через запятую)',
    prodFeaturesEn: 'Характеристики EN (через запятую)',
    prodBrandColor: 'Цвет бренда (hex)',
    prodImageClick: 'Нажмите для загрузки фото',
    prodDeleteConfirm: 'Удалить этот товар?',
    prodInStock: 'В наличии',
    setTitle: 'Настройки сайта',
    setPhone: 'Телефон',
    setEmail: 'Email',
    setAddress: 'Адрес',
    setHours: 'Рабочие часы',
    setWhatsapp: 'Номер WhatsApp (с +)',
    setTelegram: 'Имя пользователя Telegram (без @)',
    setHeroSection: 'Главная страница — Hero',
    setHeroTitleLv: 'Заголовок LV',
    setHeroTitleRu: 'Заголовок RU',
    setHeroTitleEn: 'Заголовок EN',
    setHeroSubtitleLv: 'Подзаголовок LV',
    setHeroSubtitleRu: 'Подзаголовок RU',
    setHeroSubtitleEn: 'Подзаголовок EN',
    setStatsSection: 'Статистика (главная страница)',
    setStat1Value: 'Число 1 (напр. 500+)',
    setStat1LabelLv: 'Подпись 1 LV',
    setStat1LabelRu: 'Подпись 1 RU',
    setStat1LabelEn: 'Подпись 1 EN',
    setStat2Value: 'Число 2',
    setStat2LabelLv: 'Подпись 2 LV',
    setStat2LabelRu: 'Подпись 2 RU',
    setStat2LabelEn: 'Подпись 2 EN',
    setStat3Value: 'Число 3',
    setStat3LabelLv: 'Подпись 3 LV',
    setStat3LabelRu: 'Подпись 3 RU',
    setStat3LabelEn: 'Подпись 3 EN',
    setContactsSection: 'Страница контактов',
    setContactsTitleLv: 'Заголовок LV',
    setContactsTitleRu: 'Заголовок RU',
    setContactsTitleEn: 'Заголовок EN',
    setContactsSubtitleLv: 'Подзаголовок LV',
    setContactsSubtitleRu: 'Подзаголовок RU',
    setContactsSubtitleEn: 'Подзаголовок EN',
    setContactsFormTitleLv: 'Заголовок формы LV',
    setContactsFormTitleRu: 'Заголовок формы RU',
    setContactsFormTitleEn: 'Заголовок формы EN',
    setInstallPriceFrom: 'Монтаж от (€)',
    setSave: 'Сохранить настройки',
    setSaved: 'Настройки сохранены!',
    pwdTitle: 'Смена пароля',
    pwdCurrent: 'Текущий пароль',
    pwdNew: 'Новый пароль',
    pwdConfirm: 'Подтвердить новый пароль',
    pwdChange: 'Изменить пароль',
    pwdChanged: 'Пароль успешно изменён!',
    pwdError: 'Неверный текущий пароль',
    pwdMismatch: 'Пароли не совпадают',
    pwdShort: 'Минимум 6 символов',
    loading: 'Загрузка...',
    saving: 'Сохранение...',
    confirm: 'Да, удалить',
    cancel: 'Отмена',
    noData: 'Нет данных',
  },
  en: {
    adminTitle: 'Admin Panel',
    navRequests: 'Requests',
    navProducts: 'Products',
    navSettings: 'Settings',
    navPassword: 'Change Password',
    navLogout: 'Logout',
    loginTitle: 'Admin Login',
    loginDesc: 'AirComfort Admin',
    passwordLabel: 'Password',
    loginBtn: 'Sign In',
    loginLoading: 'Signing in...',
    loginError: 'Invalid password',
    reqTitle: 'Customer Requests',
    reqEmpty: 'No requests yet',
    reqEmptyDesc: 'New requests from the website will appear here',
    reqColName: 'Name',
    reqColPhone: 'Phone',
    reqColEmail: 'Email',
    reqColMsg: 'Message',
    reqColDate: 'Date',
    reqColService: 'Service',
    reqNew: 'New',
    reqRead: 'Read',
    reqMarkRead: 'Mark as read',
    reqDelete: 'Delete',
    reqFilterAll: 'All',
    reqFilterNew: 'New only',
    navTexts: 'Site Texts',
    textsTitle: 'Site Texts',
    textsHeroSection: 'Hero Section',
    textsServicesSection: 'Services Section',
    textsCatsSection: 'Categories Section',
    textsSave: 'Save Texts',
    textsSaved: 'Texts saved!',
    textsTitleLv: 'Title LV',
    textsTitleRu: 'Title RU',
    textsTitleEn: 'Title EN',
    textsSubtitleLv: 'Subtitle LV',
    textsSubtitleRu: 'Subtitle RU',
    textsSubtitleEn: 'Subtitle EN',
    textsNameLv: 'Name LV',
    textsNameRu: 'Name RU',
    textsNameEn: 'Name EN',
    textsDescLv: 'Description LV',
    textsDescRu: 'Description RU',
    textsDescEn: 'Description EN',
    textsSupply: 'Supply',
    textsInstall: 'Installation',
    textsMaint: 'Maintenance',
    textsConsult: 'Consultation',
    textsCatHome: 'Home Air Conditioners',
    textsCatHp: 'Heat Pumps Air-to-Air',
    textsCatComm: 'Commercial HVAC',
    textsCatIhp: 'Heat Pumps Air-to-Water',
    prodTitle: 'Product Management',
    prodAdd: 'Add Product',
    prodEdit: 'Edit',
    prodDelete: 'Delete',
    prodSave: 'Save',
    prodCancel: 'Cancel',
    prodAddTitle: 'Add Product',
    prodEditTitle: 'Edit Product',
    prodBrand: 'Brand',
    prodNameLv: 'Name (LV)',
    prodNameRu: 'Name (RU)',
    prodNameEn: 'Name (EN)',
    prodCategory: 'Category',
    prodCatHome: 'Home Air Conditioners',
    prodCatHeatPump: 'Heat Pumps Air-to-Air',
    prodCatCommercial: 'Commercial HVAC',
    prodCatCommercialHeatPump: 'Heat Pumps Air-to-Water',
    prodPower: 'Power (kW)',
    prodArea: 'Coverage Area (m², e.g. 20–25)',
    prodPrice: 'Price (EUR)',
    prodInstallPrice: 'Installation (EUR)',
    prodEnergyClass: 'Energy Class',
    prodFeatures: 'Features',
    prodFeaturesLv: 'Features LV (comma-separated)',
    prodFeaturesRu: 'Features RU (comma-separated)',
    prodFeaturesEn: 'Features EN (comma-separated)',
    prodBrandColor: 'Brand Color (hex)',
    prodImageClick: 'Click to upload photo',
    prodDeleteConfirm: 'Delete this product?',
    prodInStock: 'In Stock',
    setTitle: 'Site Settings',
    setPhone: 'Phone',
    setEmail: 'Email',
    setAddress: 'Address',
    setHours: 'Working Hours',
    setWhatsapp: 'WhatsApp Number (with +)',
    setTelegram: 'Telegram Username (without @)',
    setHeroSection: 'Home Page — Hero',
    setHeroTitleLv: 'Title LV',
    setHeroTitleRu: 'Title RU',
    setHeroTitleEn: 'Title EN',
    setHeroSubtitleLv: 'Subtitle LV',
    setHeroSubtitleRu: 'Subtitle RU',
    setHeroSubtitleEn: 'Subtitle EN',
    setStatsSection: 'Statistics (home page)',
    setStat1Value: 'Value 1 (e.g. 500+)',
    setStat1LabelLv: 'Label 1 LV',
    setStat1LabelRu: 'Label 1 RU',
    setStat1LabelEn: 'Label 1 EN',
    setStat2Value: 'Value 2',
    setStat2LabelLv: 'Label 2 LV',
    setStat2LabelRu: 'Label 2 RU',
    setStat2LabelEn: 'Label 2 EN',
    setStat3Value: 'Value 3',
    setStat3LabelLv: 'Label 3 LV',
    setStat3LabelRu: 'Label 3 RU',
    setStat3LabelEn: 'Label 3 EN',
    setContactsSection: 'Contacts Page',
    setContactsTitleLv: 'Title LV',
    setContactsTitleRu: 'Title RU',
    setContactsTitleEn: 'Title EN',
    setContactsSubtitleLv: 'Subtitle LV',
    setContactsSubtitleRu: 'Subtitle RU',
    setContactsSubtitleEn: 'Subtitle EN',
    setContactsFormTitleLv: 'Form Title LV',
    setContactsFormTitleRu: 'Form Title RU',
    setContactsFormTitleEn: 'Form Title EN',
    setInstallPriceFrom: 'Installation from (€)',
    setSave: 'Save Settings',
    setSaved: 'Settings saved!',
    pwdTitle: 'Change Password',
    pwdCurrent: 'Current Password',
    pwdNew: 'New Password',
    pwdConfirm: 'Confirm New Password',
    pwdChange: 'Change Password',
    pwdChanged: 'Password changed successfully!',
    pwdError: 'Wrong current password',
    pwdMismatch: 'Passwords do not match',
    pwdShort: 'Minimum 6 characters',
    loading: 'Loading...',
    saving: 'Saving...',
    confirm: 'Yes, delete',
    cancel: 'Cancel',
    noData: 'No data',
  },
} as const;
