// Global State

const state = {
    currentPage: window.location.pathname,
    currentCategory: 'Beef',
    currentCountry: 'American',
    type: 'categories',
    searchTerm: '',
    searchType: '',
    api: {
        url: 'https://www.themealdb.com/api/json/v1/1/'
    }
}

// Updating state for new page

function loadStateFromLink() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.size) {
        state.type = urlParams.get('type');
        state.currentCategory = urlParams.get('queryCat');
        state.currentCountry = urlParams.get('queryArea');
    }

}

// Display section's type slider

async function displaySlider(type) {
    const { meals } = await getData(`list.php?${type === 'categories' ? 'c' : 'a'}=list`); 

    if (type === 'categories' && state.currentPage === '/index.html') {
            state.currentCategory = meals[0].strCategory;
            updateSeeAllLinks();
        } else if (type === 'area' && state.currentPage === '/index.html') {
            state.currentCountry = meals[0].strArea;
            updateSeeAllLinks();
        }
    
    meals.forEach(meal => {
        const div = document.createElement('div');
        div.classList.add('swiper-slide','type');
        
        if (meal.strCategory === state.currentCategory || meal.strArea === state.currentCountry) {
            div.classList.add('selected');
        }
        
        div.innerHTML = `<h2>${type === 'categories' ? meal.strCategory : meal.strArea}</h2>`;

        if (type === 'categories') {
            document.querySelector('#meal-by-category .swiper .swiper-wrapper').appendChild(div);
        } else {
            document.querySelector('#meal-by-country .swiper .swiper-wrapper').appendChild(div);  
        }
        
        div.addEventListener('click', (e) => {
            selectType(e,type);
        });
    })
    
    displayMeals(type);
    initSwiper();
}

function initSwiper() {
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        freeMode: true,
        breakpoints: {
            320: {
                slidesPerView: 2
            },
            700: {
                slidesPerView: 4
            },
            1200: {
                slidesPerView: 6
            },
            2200: {
                slidesPerView: 6
            }
        }
    })
}

// Select meal type 

async function selectType(e,type) {
    const mealsWrapper = document.querySelector(`#meal-${type === 'categories' ? 'category' : 'area'}`)
  
    if (type === 'categories' ) {
        state.currentCategory = e.currentTarget.children[0].textContent;
        if (state.currentPage === '/index.html') {
            updateSeeAllLinks()
        }
    } else if (type === 'area') {
        state.currentCountry = e.currentTarget.children[0].textContent;
        
        if (state.currentPage === '/index.html') {
            updateSeeAllLinks()
        }
    }
    

    if (!e.currentTarget.classList.contains('selected') ) {
            e.currentTarget.parentElement.querySelector('.selected').classList.remove('selected');
            e.currentTarget.classList.add('selected');
            mealsWrapper.innerHTML = '';
            displayMeals(`${type === 'categories' ? 'categories' : 'area'}`)
    } 
        
}

// Display section's meals

async function displayMeals(type) {
    const {meals} = await getData(`filter.php?${type === 'categories' ? 'c' : 'a'}=${type === 'categories' ? state.currentCategory : state.currentCountry}`);
    
    meals.forEach(meal => {
        
        const div = document.createElement('div');
        div.classList.add('swiper-slide','card'); 
        
        div.innerHTML = `<a class='flex-column flex-center' href="recipe-details.html?id=${meal.idMeal}">
            <img src="${meal.strMealThumb}" alt="noimg">
            <h2>${meal.strMeal}</h2>
        </a>`;
        if (type === 'categories') {
            document.querySelector('#meal-category').appendChild(div);
        } else {
            document.querySelector('#meal-area').appendChild(div);
        }
    })
    
}

// Display recipe details

async function displayRecipeDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const mealId = urlParams.get('id');
    const {meals} = await getData(`lookup.php?i=${mealId}`);
    const recipeContainer = document.querySelector('#recipe-container');

    recipeContainer.innerHTML = `<div class="recipe-header">
              <h2>${meals[0].strMeal}</h2>
              <img src="${meals[0].strMealThumb}" alt="meal">
            </div>
            <div class="recipe-body">
              <div class="ingredients flex-column">
                <h2>Ingredients</h2>
                <ul class="flex-column">
                ${
                    Object.entries(meals[0]).map(pair => {
                        if (pair[0].includes("strIngredient") && pair[1] !== "" && pair[1] !== null) {
                            const number = pair[0].slice(13);
                            return `<a href="#">
                                        <li class="flex-row flex-center">
                                            <p class="measure">${meals[0]['strMeasure' + number]}</p>
                                            <p class="ingredient">${pair[1]}</p>
                                            <img src="https://www.themealdb.com/images/ingredients/${pair[1]}.png" alt="${pair[1]}">
                                        </li>
                                    </a>`
                        } else {
                            return ''
                        }
                    }).join("")
                }
                </ul>
              </div>
              <div class="instructions flex-column">
                <h2>Instructions</h2>
                <p>${meals[0].strInstructions.replace(new RegExp('\r?\n','g'), '<br />')}</p>
              </div>
            </div>`;

    // console.log(meals, Object.entries(meals[0]));

    
} 

// Display search results

async function search() {
    const urlParams = new URLSearchParams(window.location.search);
    
    state.searchTerm = urlParams.get('search-term');
    state.searchType = urlParams.get('type')

    if (state.searchTerm !== '' && state.searchTerm !== null) {
        if (state.searchType === 'meal') {
            const results = await getData(`search.php?s=${state.searchTerm}`);

            if (results.meals === null) {
                showAlert('No Results Found! Please enter a valid meal.');
                return;
            }

            displayHeader(results.meals.length, state.searchTerm);
            displaySearchResults(results);
        } else {
            const results = await getData(`filter.php?i=${state.searchTerm}`);

            if (results.meals === null) {
                showAlert('No Results Found! Please enter a valid ingredient.');
                return;
            }

            displayHeader(results.meals.length, state.searchTerm);
            displaySearchResults(results);
        }
    }
}

// Display Search Results

function displaySearchResults(results) {
    const {meals} = results;
    const searchResults = document.querySelector('#search-results');

    // searchResults.innerHTML = '';

    meals.forEach(meal => {
        const div = document.createElement('div');
        div.classList.add('card');

        div.innerHTML = `<div class="card">
                            <a class='flex-column flex-center' href="recipe-details.html?id=${meal.idMeal}">
                                <img src="${meal.strMealThumb}" alt="noimg">
                                <h2>${meal.strMeal}</h2>
                            </a>
                        </div>`

        searchResults.appendChild(div);
    })
    
}

// Display Search Header

function displayHeader(length, term) {
    document.querySelector('.search-header').innerHTML = `<strong>${length}</strong> results found for <strong>${term}</strong>`

}

// Update links

function updateSeeAllLinks() {
    const links = document.querySelectorAll('.section-header a');

    links[0].setAttribute('href',`/recipes.html?queryCat=${state.currentCategory}&queryArea=${state.currentCountry}&type=categories`)
    links[1].setAttribute('href',`/recipes.html?queryCat=${state.currentCategory}&queryArea=${state.currentCountry}&type=area`)
}

// Hide section
function hideSection(type) {
    if (type === 'categories') {
        document.querySelector('#meal-by-category').style.display = 'flex';
        document.querySelector('#meal-by-country').style.display = 'none';
    } else {
        document.querySelector('#meal-by-country').style.display = 'flex';
        document.querySelector('#meal-by-category').style.display = 'none';
    }
} 

//  Update tab

function updateTab(type) {
    const tabs = document.querySelectorAll('.tab h2');

    tabs.forEach(tab => {
        if (type === tab.textContent.toLowerCase()) {
            tab.parentElement.classList.add('selected');
        }
    })
}

// Select Tab

function selectTab(e) {
    const tabs = document.querySelectorAll('.tab');
    if (!e.currentTarget.classList.contains('selected')) {
        tabs.forEach( tab => {
            if (tab.classList.contains('selected')) {
                tab.classList.remove('selected');
            }
        })
        state.type = e.currentTarget.children[0].textContent.toLowerCase();
        e.currentTarget.classList.add('selected');
        hideSection(state.type);
        displaySlider(state.type);
    }
}

// Show spinner loading when fetching data

function Spinner(showHide) {
    if (showHide === 'show') {
        document.querySelector('.spinner').classList.add(showHide);
    } else {
        document.querySelector('.spinner').classList.remove('show');
    }
}

// Show Alert Function

function showAlert(message) {
    const alertEl = document.createElement('div');
    alertEl.classList.add('alert');
    alertEl.appendChild(document.createTextNode(message));

    document.querySelector('#alert').appendChild(alertEl);

    setTimeout(() => alertEl.remove(), 5000);

}

// Fetching API Data

async function getData(endpoint) {
    const API_URL = state.api.url;
    Spinner('show');
    const response = await fetch(`${API_URL}/${endpoint}`);
    const data = await response.json();
    
    Spinner('hide');

    return data;
}

// Initialize App

function init() {

    switch (state.currentPage) {
        case '/':
        case '/index.html':
            displaySlider('categories');
            displaySlider('area');
            break;
        case '/recipes.html':
            const tabs = document.querySelectorAll('.tab');
            loadStateFromLink();
            hideSection(state.type);
            updateTab(state.type);
            displaySlider(state.type);
            tabs.forEach(tab => tab.addEventListener('click', selectTab));
            break;
            case '/recipe-details.html':
                displayRecipeDetails();
                break;
            case '/search.html':
                search();
                break;
    }

    
}

document.addEventListener('DOMContentLoaded', init);
