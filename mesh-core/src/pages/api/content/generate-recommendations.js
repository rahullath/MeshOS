// src/pages/api/content/generate-recommendations.js - Generate content recommendations
import dbConnect from '../../../lib/mongodb';
import Media from '../../../models/Media';
import Recommendation from '../../../models/Recommendation';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      // 1. Get user's watched media
      const watchedMedia = await Media.find({ userId: req.user.id });
      
      if (watchedMedia.length === 0) {
        return res.status(400).json({ 
          message: 'No watched content found. Add some content to get recommendations.'
        });
      }
      
      // 2. Analyze watched content for preferences
      const typeCount = {};
      const genreCount = {};
      const directorCount = {};
      const authorCount = {};
      const languageCount = {};
      
      watchedMedia.forEach(item => {
        // Count by type
        typeCount[item.type] = (typeCount[item.type] || 0) + 1;
        
        // Count by genre
        if (item.genre) {
          genreCount[item.genre] = (genreCount[item.genre] || 0) + 1;
        }
        
        // Count by director (for movies/shows)
        if (item.director && ['movie', 'tvshow'].includes(item.type)) {
          directorCount[item.director] = (directorCount[item.director] || 0) + 1;
        }
        
        // Count by author (for books/podcasts)
        if (item.author && ['book', 'podcast'].includes(item.type)) {
          authorCount[item.author] = (authorCount[item.author] || 0) + 1;
        }
        
        // Count by language
        if (item.language) {
          languageCount[item.language] = (languageCount[item.language] || 0) + 1;
        }
      });
      
      // Get top preferences
      const getTopItems = (obj, count = 3) => {
        return Object.entries(obj)
          .sort((a, b) => b[1] - a[1])
          .slice(0, count)
          .map(([key]) => key);
      };
      
      const topGenres = getTopItems(genreCount);
      const topDirectors = getTopItems(directorCount);
      const topAuthors = getTopItems(authorCount);
      const topLanguages = getTopItems(languageCount);
      
      // Get preferred content types
      const contentTypes = Object.keys(typeCount).sort((a, b) => typeCount[b] - typeCount[a]);
      
      // 3. Generate recommendations using a simple algorithm
      // (In a production app, you might use a more sophisticated recommendation engine or AI API)
      const recommendations = [];
      
      // Example content database (this would typically come from an API or larger database)
      // In a real app, you'd use an external API or connect to a content database
      const contentDatabase = {
        movies: [
          { title: 'The Shawshank Redemption', genre: 'Drama', director: 'Frank Darabont', language: 'English' },
          { title: 'The Godfather', genre: 'Crime', director: 'Francis Ford Coppola', language: 'English' },
          { title: 'Pulp Fiction', genre: 'Crime', director: 'Quentin Tarantino', language: 'English' },
          { title: 'The Dark Knight', genre: 'Action', director: 'Christopher Nolan', language: 'English' },
          { title: 'Spirited Away', genre: 'Animation', director: 'Hayao Miyazaki', language: 'Japanese' }
        ],
        tvshows: [
          { title: 'Breaking Bad', genre: 'Drama', director: 'Vince Gilligan', language: 'English' },
          { title: 'Game of Thrones', genre: 'Fantasy', director: 'Various', language: 'English' },
          { title: 'The Wire', genre: 'Crime', director: 'David Simon', language: 'English' },
          { title: 'Friends', genre: 'Comedy', director: 'Various', language: 'English' },
          { title: 'Money Heist', genre: 'Crime', director: 'Álex Pina', language: 'Spanish' }
        ],
        books: [
          { title: '1984', genre: 'Dystopian', author: 'George Orwell', language: 'English' },
          { title: 'To Kill a Mockingbird', genre: 'Fiction', author: 'Harper Lee', language: 'English' },
          { title: 'The Great Gatsby', genre: 'Fiction', author: 'F. Scott Fitzgerald', language: 'English' },
          { title: 'One Hundred Years of Solitude', genre: 'Magical Realism', author: 'Gabriel García Márquez', language: 'Spanish' },
          { title: 'Crime and Punishment', genre: 'Psychological Fiction', author: 'Fyodor Dostoevsky', language: 'Russian' }
        ],
        podcasts: [
          { title: 'Serial', genre: 'True Crime', author: 'Sarah Koenig', language: 'English' },
          { title: 'This American Life', genre: 'Documentary', author: 'Ira Glass', language: 'English' },
          { title: 'Radiolab', genre: 'Science', author: 'Jad Abumrad', language: 'English' },
          { title: 'The Joe Rogan Experience', genre: 'Talk', author: 'Joe Rogan', language: 'English' },
          { title: 'TED Talks Daily', genre: 'Educational', author: 'Various', language: 'English' }
        ]
      };
      
      // Check if item is already in the user's watched content
      const isAlreadyWatched = (item, type) => {
        return watchedMedia.some(m => 
          m.type === type && 
          m.title.toLowerCase() === item.title.toLowerCase()
        );
      };
      
      // Generate recommendations for each content type
      for (const type of contentTypes) {
        const dbKey = `${type}s`; // Convert 'movie' to 'movies', etc.
        const db = contentDatabase[dbKey] || [];
        
        // Filter by user preferences
        const filteredContent = db.filter(item => {
          // Skip if already watched
          if (isAlreadyWatched(item, type)) return false;
          
          // Prefer items that match user's top genres
          if (item.genre && topGenres.includes(item.genre)) return true;
          
          // Prefer items from favorite directors/authors
          if (type === 'movie' || type === 'tvshow') {
            if (item.director && topDirectors.includes(item.director)) return true;
          } else {
            if (item.author && topAuthors.includes(item.author)) return true;
          }
          
          // Prefer items in favorite languages
          if (item.language && topLanguages.includes(item.language)) return true;
          
          return false;
        });
        
        // Add matching items to recommendations
        for (const item of filteredContent) {
          let reason = "Based on your viewing history";
          
          if (item.genre && topGenres.includes(item.genre)) {
            reason = `Because you enjoy ${item.genre}`;
          } else if ((type === 'movie' || type === 'tvshow') && item.director && topDirectors.includes(item.director)) {
            reason = `Because you like other works by ${item.director}`;
          } else if ((type === 'book' || type === 'podcast') && item.author && topAuthors.includes(item.author)) {
            reason = `Because you enjoy content by ${item.author}`;
          }
          
          recommendations.push({
            userId: req.user.id,
            type,
            title: item.title,
            genre: item.genre,
            language: item.language,
            director: item.director,
            author: item.author,
            reason,
            source: 'gemini' // Indicating this was auto-generated
          });
        }
      }
      
      // 4. Save new recommendations (limit to 10)
      const newRecommendations = recommendations.slice(0, 10);
      
      if (newRecommendations.length === 0) {
        return res.status(200).json({ 
          message: 'No new recommendations found based on your preferences',
          recommendationsAdded: 0
        });
      }
      
      // Save to database
      await Recommendation.insertMany(newRecommendations);
      
      res.status(201).json({ 
        message: 'Recommendations generated successfully',
        recommendationsAdded: newRecommendations.length,
        recommendations: newRecommendations
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
