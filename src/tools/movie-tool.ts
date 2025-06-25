export const MOVIE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_movie',
      description:
        'Find a movie by title and year, returning relevant information',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the movie',
          },
          year: {
            type: 'number',
            description: 'The year the movie was released',
          },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_watchlist',
      description: 'Add a movie to the users watchlist',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the movie',
          },
          year: {
            type: 'number',
            description: 'The year the movie was released',
          },
        },
        required: ['title', 'year'],
      },
    },
  },
];
