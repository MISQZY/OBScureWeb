import { defineI18n } from 'fumadocs-core/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'ru'],
  // Docs content lives under content/docs/<lang>/... (one folder per
  // language) instead of dot-suffixed filenames (page.ru.mdx) mixed into a
  // single shared folder.
  parser: 'dir',
});

export const i18nUI = defineI18nUI(i18n, {
  en: {
    displayName: 'English',
  },
  ru: {
    displayName: 'Русский',
    'Search(search dialog)': 'Поиск',
    'Search(search trigger)': 'Поиск',
    'On this page(table of contents)': 'На этой странице',
    'No results found(search dialog)': 'Ничего не найдено',
    'Next Page(pagination)': 'Далее',
    'Previous Page(pagination)': 'Назад',
    'Edit on GitHub(edit page)': 'Редактировать на GitHub',
    'Last updated on(page footer)': 'Последнее обновление:',
    'Choose a language(language switcher)': 'Выберите язык',
    'Page Not Found(404 page)': 'Страница не найдена',
    'Table of Contents(inline table of contents)': 'Оглавление',
    'Back to Home(404 page)': 'Вернуться на главную',
    'Hide Sidebar(sidebar)': 'Скрыть меню',
    'Show Sidebar(sidebar)': 'Показать меню',
  }
});