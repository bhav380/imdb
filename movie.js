(function(){

    const API_KEY = "5d3bf326";

    /* __________________________________________fetch Movie Data_________________________________________________________*/
  
    function bindData(movie){

    
        const poster = document.querySelector('#movie-data-container img');
        const title = document.querySelector('#movie-data-container .card-body .card-title');
        const plot = document.querySelector('#movie-data-container .card-body .card-text');
        const actors = document.querySelector('#actors');
        const director = document.querySelector('#director');
        const genre = document.querySelector('#genre');
        const year = document.querySelector('#year');
        const language = document.querySelector('#language');
        const imdbRating = document.querySelector('#imdbRating');

        title.innerHTML = movie.Title;
        plot.innerHTML = movie.Plot;
        actors.innerHTML = movie.Actors;
        director.innerHTML = movie.Director;
        genre.innerHTML = movie.Genre;
        year.innerHTML = movie.Year;
        language.innerHTML = movie.Language;
        imdbRating.innerHTML = movie.imdbRating;

        if(movie.Poster=='N/A'){
            poster.src = './images/imgNotAvailable.jpg';
        }else{
            poster.src = movie.Poster;
        }
    }

    async function fetchMovieData(movieImdbid){
        let url = `https://www.omdbapi.com/?i=${movieImdbid}&plot=full&apiKey=${API_KEY}`;
        const res = await fetch(`${url}`);
        const data = await res.json();
        bindData(data);
    }


    //_________________________________________________ADD to favorites________________________________________________________________


    async function addToFavorites(imdbid){

        let imdbidArray = JSON.parse(localStorage.getItem('favMoviesImdbid'));     // extracts imdbids present in favMoviesImdbid from localStorage
        let alreadyPresent = false;

        imdbidArray.forEach( (id)=>{
             if( id==imdbid){                                // if imdbid is already inside imdbidArray (i.e, already saved as favorites)
                alert('Already present in favorites');
                alreadyPresent = true;   
            } 
        });
    
        if(!alreadyPresent && confirm('Add to Favorites')){           // if imdbid is not present in imdbidArray 
            imdbidArray.push(imdbid);               // add it to array
            localStorage.setItem('favMoviesImdbid', JSON.stringify(imdbidArray));   // store updated array in localStorage
        }
    }


    //______________________________________________________window.onload()_________________________________________________________________________________


    window.onload = ()=>{
        
        let movieImdbid = localStorage.getItem('seeMovieImdbid');     // extracts imdbid from seeMovieImdbid variable in localStorage
        fetchMovieData(movieImdbid);                                  // fetches movie data using imdbi


        let favBtn = document.getElementById('add-to-favorites');     
        favBtn.onclick =  ()=>{                                       // onclicking add to favorties button
           addToFavorites(movieImdbid);     
        }

        let watchBtn = document.getElementById('watch'); 
        watchBtn.onclick = ()=>{                                      // watched alert
            alert('Thanks For Watching !!!');
        }
    }
})();
