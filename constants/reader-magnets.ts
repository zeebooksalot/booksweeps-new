export const READER_MAGNET_CONFIG = {
  mobileBreakpoint: 768,
  searchDebounceDelay: 300,
  defaultFilters: {
    searchTerm: '',
    selectedGenre: 'all',
    selectedFormat: 'all',
    showAdvancedFilters: false
  }
}

export const READER_MAGNET_FORMATS = [
  { value: 'all', label: 'All Formats' },
  { value: 'pdf', label: 'PDF' },
  { value: 'epub', label: 'EPUB' },
  { value: 'mobi', label: 'MOBI' },
  { value: 'chapter', label: 'Chapter' }
] as const

export const READER_MAGNET_TEXT = {
  loading: 'Loading free books...',
  noBooksFound: {
    title: 'No books found',
    description: 'Try adjusting your search or filters'
  },
  filters: {
    title: 'Filters',
    genre: 'Genre',
    format: 'Format',
    allGenres: 'All Genres',
    allFormats: 'All Formats',
    clearAll: 'Clear All',
    resultsCount: (count: number) => `${count} book${count !== 1 ? 's' : ''} found`
  }
}

export const READER_MAGNET_STYLES = {
  container: 'min-h-screen bg-gray-50 dark:bg-gray-900 md:bg-white md:dark:bg-gray-900 transition-colors',
  mainContent: 'pt-20 pb-20 md:pb-8',
  contentWrapper: 'mx-0 md:mx-4 my-4 md:my-8 flex flex-col justify-center gap-8 md:flex-row',
  main: 'md:max-w-[900px] w-full',
  sidebar: 'hidden md:block w-full md:w-[280px] md:min-w-[280px]',
  filterPanel: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
  emptyState: 'flex items-center justify-center min-h-[60vh]',
  loadingState: 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50'
}
