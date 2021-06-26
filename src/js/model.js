import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON } from './helpers.js';
// import { sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
  shoppingList: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  // Get recipe
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} !!!!`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    // console.log(data);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    state.search.page = 1;
  } catch (err) {
    console.error(`${err} !!!!`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQt = oldQt * newServings / oldservings // 2 * 8 / 4 = 4
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Add boomark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // remove boomark
  const index = state.bookmarks.findIndex(el => el.id === id);

  state.bookmarks.splice(index, 1);

  // Mark current recipe as not bookmarked anymore
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const persistShoppingList = function () {
  localStorage.setItem('shoppingList', JSON.stringify(state.shoppingList));
};

export const addIngredient = function (item) {
  // Add boomark
  state.shoppingList.push(item);
  persistShoppingList();
};

export const removeIngredient = function (itemDescription) {
  // get index of item
  const index = state.shoppingList.indexOf(itemDescription);
  // remove item from model state if it exists
  if (index > -1) state.shoppingList.splice(index, 1);

  // update view
  persistShoppingList();
};

const init = function () {
  const bookmarkStorage = localStorage.getItem('bookmarks');
  if (bookmarkStorage) state.bookmarks = JSON.parse(bookmarkStorage);
  const shoppingListStorage = localStorage.getItem('shoppingList');
  if (shoppingListStorage) state.shoppingList = JSON.parse(shoppingListStorage);
};

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const clearShoppingList = function () {
  localStorage.clear('shoppingList');
};

init();

export const uploadRecipe = async function (newRecipe) {
  try {
    const data = await AJAX(`${API_URL}?key=${KEY}`, newRecipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
