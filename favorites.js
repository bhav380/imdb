(function () {

    const API_KEY = "5d3bf326";

    if (localStorage.getItem('favMoviesImdbid') == null) {                   // if favMoviesImdbid in local storage is null create favMoviesImdbid which will store imdbid of movies added to favorites
        localStorage.setItem('favMoviesImdbid', JSON.stringify([]));
    }

    //_________________________________________________Fetch and append Fav Movies to #fav-movies__________________________________________________________________
    function fillDataInCard(cardClone, movie) {

        const movieCard = cardClone.querySelector('.favorite-movie-card');
        const poster = cardClone.querySelector('.favorite-movie-card div img');
        const title = cardClone.querySelector('.title');
        const year = cardClone.querySelector('.year');
        const type = cardClone.querySelector('.type');
        const watchBtn = cardClone.querySelector('.watch');
        const deleteBtn = cardClone.querySelector('.delete i');

        movieCard.dataset.idimdb = movie.imdbID;
        watchBtn.dataset.imdbid = movie.imdbID;
        deleteBtn.dataset.imdbid = movie.imdbID;
        year.innerHTML = movie.Year;
        type.innerHTML = movie.Type;


        if(movie.Poster=='N/A'){
            poster.src = './images/imgNotAvailable.jpg';
        }else{
            poster.src = movie.Poster;
        }

        if (movie.Title.length > 37) {       // if title length is greater than 37 , 37 characters of fetched title will be inserted inside title element
            title.innerHTML = `${movie.Title.slice(0, 36)}...`
        } else {
            title.innerHTML = movie.Title;
        }
    }

    async function fetchMovieData(movieImdbid) {

        const templateFavMovie = document.getElementById('template-fav-movie');       
        const favMovies = document.getElementById('fav-movies');
        let url = `https://www.omdbapi.com/?i=${movieImdbid}&apiKey=${API_KEY}`;

        const res = await fetch(`${url}`);
        const data = await res.json();

        const cardClone = templateFavMovie.content.cloneNode('true');
        fillDataInCard(cardClone, data);                // fills data of fetched movie to cardClone
        favMovies.appendChild(cardClone);               // appends cardClone to #fav-movies (favMovies)
    }

    function appendFavMovies() {
        const favMovies = document.getElementById('fav-movies');
        favMovies.innerHTML='';
        let imdbidArray = JSON.parse(localStorage.getItem('favMoviesImdbid'));
        imdbidArray.forEach((id) => {
            fetchMovieData(id);              //fetched movie from api using imdbid and adds it to #fav-movies
        });
    }


    //_________________________________________Add and Remove From Favorites (using start icon in movie cards)_____________________________________
    function addToFavorites(imdbid) {

        let imdbidArray = JSON.parse(localStorage.getItem('favMoviesImdbid'));
        imdbidArray.push(imdbid);
        // console.log(imdbidArray);
        localStorage.setItem('favMoviesImdbid', JSON.stringify(imdbidArray));
        fetchMovieData(imdbid);
    }

    function removeFromFavorites(imdbid) {

        let imdbidArray = JSON.parse(localStorage.getItem('favMoviesImdbid'));
        imdbidArray = imdbidArray.filter((id) => {        // removes imdbid from imdbidArray
            if (id != imdbid) {
                return id;
            }
        });

        let favMoviesBox = document.querySelector('#fav-movies')
        let target = favMoviesBox.querySelectorAll(`[data-idimdb="${imdbid}"]`);
        target[0].remove();      // removes movie from #fav-movies box
        localStorage.setItem('favMoviesImdbid', JSON.stringify(imdbidArray));  // saves updated imdbidArray in localStorage
    }

    function addAndRemoveFavorites() {

        let imdbCloneContainerMain = document.querySelector('#imdb-clone-container main');
        imdbCloneContainerMain.addEventListener('click', (event) => {

            if (event.target.className == 'fa-solid fa-star') {    // if star icon is clicked

                event.target.parentElement.style.outline = 'none';    // removing onclick border property of button which contains fa-star icon

                if (event.target.dataset.isfav == 'false' && confirm('Add to favories ? ')) {    // if movie is not present in favorites
                    event.target.dataset.isfav = 'true';          
                    event.target.style.color = 'red';                            // color of start icon is set to red
                    event.target.style.fontSize = '1.2rem';
                    addToFavorites(event.target.dataset.imdbid);                   // saves imdbid of movie in localstorage and adds it to #fav-movies box

                } else if(confirm('Remove from favorites ?')) {                 // if movie is present in favorites , deletes imdbid of this movie from localStorage and removes this movie from #fav-movies box 
                    removeFromFavorites(event.target.dataset.imdbid);
                    event.target.dataset.isfav = 'false';
                    event.target.style.color = '#d54b90';                       // color of star icon is set to light pink
                    event.target.style.fontSize = '1rem'
                }
            }
        });
    }

    // __________________________________display favorite page_________________________________
    function favoriteMoviePage() {

        let openFavPageButton = document.querySelector('#nav-items>a:nth-child(3)');
        let closeFavPage = document.querySelector('#close-favorites');

        let favoritesContainer = document.getElementById('favorites-container');
        let main = document.querySelector('#imdb-clone-container main');
        openFavPageButton.addEventListener('click', (e) => {
            e.preventDefault();
            favoritesContainer.style.display = 'flex';
            main.style.opacity = '0.65';

        });

        closeFavPage.onclick = () => {
            favoritesContainer.style.display = 'none';
            main.style.opacity = '1';
        }
    }


    // ________________________________________see movie Details (watch button linked to movie.html page) and Delete functionality using trash icon_______________________________________________

    function seeMovieDetailsAndDelete() {
        let favMovies = document.getElementById('fav-movies')

        favMovies.addEventListener('click', (event) => {

            if (event.target.className == 'watch') {                // on clicking watch button
                localStorage.setItem("seeMovieImdbid", event.target.dataset.imdbid);   // seeMovieImdbid variable in localStorage is used by movie.js to show movie details, it stores imdbid of movie whose details users wants to watch
                window.location.href = './movie.html';                           // opens movie.html page
            }

            if (event.target.className == 'fa-solid fa-trash' && confirm('Remove From Favorites ?')) {  // on clicking delete button

                removeFromFavorites(event.target.dataset.imdbid);            
                imdbApp.getTopMovies();             // refreshes movies inside #top-movies-container in main (to change data attribute isFav of removed movie from true to false and fa-star-icon color (from red to light pink) )

                let movieName = document.querySelector('#search div #movie-name');
                let year = document.querySelector('#search div #year');
                imdbApp.movieSuggestions(movieName,year);  // refreshes movie suggestions (changes isFav data attribute of removed movie to false)
            }
        });
    }

    function favorites() {

        appendFavMovies();            // adds movies whose imdbid is present inside favMoviesImdbid (localStorage variable) in DOM

        addAndRemoveFavorites();      // add and remove favortie movies (using fa-star icon) functionality inside movie cards present in main 

        favoriteMoviePage();           // this function displays favMovies on clicking favorites link in navbar and adds close fav page functionality 

        seeMovieDetailsAndDelete();   // links watch button of movies (inside #fav-movies) to movie.html page and adds delete movie functionality
    }

    //_____________________________________call to favorites()___________________________________________________________________________________

    favorites();  

})();





    // function favoriteMoviePage() {


    //     let openFavPageButton = document.querySelector('#nav-items>a:nth-child(3)');
    //     let showFavPage = false;

    //     openFavPageButton.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         showFavPage = !showFavPage;

    //         let favoritesContainer = document.getElementById('favorites-container');
    //         let main = document.querySelector('#imdb-clone-container main');

    //         if (showFavPage) {
    //             favoritesContainer.style.display = 'flex';
    //             main.style.opacity = '0.65';

    //         } else {
    //             favoritesContainer.style.display = 'none';
    //             main.style.opacity = '1';
    //         }

    //     });

    // }



    
        // let favimdbids = JSON.parse(localStorage.getItem('favMoviesImdbid'));
        // favimdbids.filter((id) => {                         
        //     if (movie.imdbID == id) {                   // if imdbid of this movie is present inside favMoviesImdbid array (present inside localStorage) delete buttons data-attribute isfav is set to true
        //         deleteBtn.dataset.isfav = 'true';
        //     }
        // });