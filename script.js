//REVEALING MODULE DESIGN PATTERN
var imdbApp = (function () {

    const API_KEY = "5d3bf326";
    var seeMovieImdbId;   //  when watch button of any movie card is clicked , this variable will store imdbid of that movie ...then value of this variable is stored inside local storage ... which then is accessed by movie.js file to render movie details
    var topMoviesImdbId = ["tt9362722", "tt15398776", "tt1517268", "tt16437278", "tt3107288", "tt6791350", "tt10366206", "tt1630029", "tt14444726", "tt11145118"]; // Movies having these imdbid will be shown inside Top Movies Container



    //performs animation on header image (zoom outs the img when page loads)
    function headerImgAnimation() {

        let img = document.querySelector("#header-img-container img");
        setTimeout(function () {
            img.style.transform = "scale(1)"
        });

    }


    // fills top-movies-container with movies whose imdbid is present inside topMoviesImdbId array
    function getTopMovies() {
        const movieCardsTemplate = document.getElementById('template-movie-card');
        const moviesContainer = document.querySelector('#top-movies-container #movies-container');
        moviesContainer.innerHTML = '';

        topMoviesImdbId.forEach(async (id) => {

            let url = `https://www.omdbapi.com/?i=${id}&apiKey=${API_KEY}`;
            const res = await fetch(`${url}`);
            const data = await res.json();

            const cardClone = movieCardsTemplate.content.cloneNode(true);  //clones #template-movie-card
            fillDataInCard(cardClone, data);
            moviesContainer.append(cardClone);                             // appends cardClone to #movies-container
        });
    }


    // on clicking watch button (inside movie card) movie.html page will open
    function seeMovieDetails(event) {

        if (event.target.className == 'btn') {
            localStorage.setItem("seeMovieImdbid", event.target.dataset.imdbid);
            event.target.href = './movie.html';
        }
    }


    //___________________________________________________________Search Movies______________________________________________________________

    function fillDataInCard(cardClone, movie) {
        const movieCard = cardClone.querySelector('.movie-card');
        const poster = cardClone.querySelector('.movie-card .image img');
        const title = cardClone.querySelector('.movie-title');
        const year = cardClone.querySelector('.year');
        const type = cardClone.querySelector('.type');
        const watchBtn = cardClone.querySelector('.btn');
        const favBtn = cardClone.querySelector('.add-to-favorites i');

        movieCard.dataset.imdbid = movie.imdbID;
        watchBtn.dataset.imdbid = movie.imdbID;
        favBtn.dataset.imdbid = movie.imdbID;
        title.innerHTML = movie.Title;;
        year.innerHTML = movie.Year;
        type.innerHTML = movie.Type;


        if(movie.Poster=='N/A'){

            poster.src = './images/imgNotAvailable.jpg';

        }else{
            poster.src = movie.Poster;
        }

        console.log(movie.Title);
        console.log(movie.Poster);

        let favimdbids = JSON.parse(localStorage.getItem('favMoviesImdbid')); // extracts imdbIds of movies inside favorties
        favimdbids.filter((id) => {
            if (movie.imdbID == id) {                // if movie is already added to favorites by user data-id attribute isFav will be set to true and addtoFav button will have red color (instead of pink)
                favBtn.dataset.isfav = 'true';
                favBtn.style.color = 'red';
                favBtn.style.fontSize = '1.1rem';
            }
        });
    }

    function bindData(movies) {

        const movieCardsContainer = document.getElementById("search-results");
        const movieCardsTemplate = document.getElementById('template-movie-card');

        movies.forEach((movie) => {
            const cardClone = movieCardsTemplate.content.cloneNode(true);     //clones #template-movie-card
            fillDataInCard(cardClone, movie);                                  //fills movie data inside cardClone
            movieCardsContainer.appendChild(cardClone);                       // appends cardClone to #search-results (movieCardsContainer)
        });
    }

    function loadMoreMovies(url, currentItem) {

        let loadMoreBtn = document.querySelector('#load-more-button');
        loadMoreBtn.style.display = 'block';
        let pageNum = 2;                       //inital value of pageNum =2

        //if load move button is clicked loads 6 more movies in DOM
        loadMoreBtn.onclick = async () => {

            let cards = document.querySelectorAll('#search-results .movie-card');
            for (let i = currentItem; i < currentItem + 6 && i < cards.length; i++) {     
                cards[i].style.display = 'flex';
            }

            currentItem += 6;

            // if currentItem exceeds number of movies present inside #searchResults , again api call is made to fetch more movies ...(one api call gets 10 movies)
            if (currentItem >= cards.length) {
                let prevCardLength = cards.length;
                if (await fetchMovies(`${url}&Page=${pageNum}`)) {           //Page = [pagenum] is passed as query in url (it gets movies from page = [pagenum] (ex-page=2 ,page=3 so on..) of api response )

                    let updatedCards = document.querySelectorAll('#search-results .movie-card');    

                    for (let i = prevCardLength; i < currentItem && i < updatedCards.length; i++) {    // loads remaining movies into DOM ( if less than 6 movies were loaded on clicking load button (this happens when there are no movies to load and we need to make api call for next page))

                        updatedCards[i].style.display = 'flex';
                    }

                } else {
                    loadMoreBtn.style.display = 'none';           // if there are no more pages to fetch movies loadMore Button display will be set to none
                }
                pageNum++;                                     
            }
        }
    }

    async function fetchMovies(url) {

        const res = await fetch(`${url}`);
        const data = await res.json();

        if (data.Response == 'False') {
            return false;                 // if fails to fetch movies , returns false
        }
        if (data.totalResults > 6) {
            loadMoreMovies(url, 6);        //on clicking loadMore button 6 more movies are loaded in DOM
        }
        bindData(data.Search);            // fills fetched movies inside #search-results
        return true;
    }

    async function movieSuggestions(movieName, year) {

        const movieCardsContainer = document.getElementById("search-results");
        movieCardsContainer.innerHTML = "";

        let url = "https://www.omdbapi.com/?";
        if (movieName.value != '') {                         //condition is executed if moviename feild is not left empty by user
            url = `${url}&s=${movieName.value}`;
        }

        if (year.value != '') {                              //condition is executed if year feild is not left empty by user
            url = `${url}&y=${year.value}`;
        }

        url = `${url}&apiKey=${API_KEY}`;

        let searchResultsMsg = document.getElementById('search-results-msg');

        if (await fetchMovies(url)) {              //fetches movies from obtained url , below code shows msg above search results depending on success of fetchMovies(url)

            searchResultsMsg.innerHTML = `Search results for <span>${movieName.value}</span> : `;
        } else {

            searchResultsMsg.innerHTML = `No result found`;
        }
    }

    function searchMovies() {

        let movieName = document.querySelector('#search div #movie-name');
        let year = document.querySelector('#search div #year');

        //on pressing keys inside search movie, shows search results automatically (no need to click search button)

        movieName.addEventListener('keyup', () => {
            movieSuggestions(movieName, year)
        }
        );

        year.addEventListener('keyup', () => {
            movieSuggestions(movieName, year)
        });
    }


    //________________________________________________window onload________________________________________________________


    window.onload = () => {

        headerImgAnimation();
        getTopMovies();

        let topMoviesContainer = document.getElementById('movies-container');
        topMoviesContainer.addEventListener('click', function (event) {         //handling clicking of watch button inside movie cards
            seeMovieDetails(event);
        });

        searchMovies();         //Search movie functionalities

        let searchResults = document.querySelector("#search-results");
        searchResults.addEventListener('click', function (event) {
            seeMovieDetails(event);
        });
    }

    return {
        SeeMovieImdbId: seeMovieImdbId,
        getTopMovies: getTopMovies,                 // exporting getTopMovies() and movieSuggestions() functions ----(used by favorite.js to toggle data-id attribute isFav of movie cards)
        movieSuggestions: movieSuggestions
    }

})();




