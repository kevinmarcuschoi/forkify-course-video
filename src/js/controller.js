import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import { MODAL_RESET_SEC } from './config.js';
import recipeView from './views/recipeView.js';

// import icons from '../img/icons.svg'; // Pacel 1

import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import addRecipeView from './views/addRecipeView.js';

import shoppingListView from './views/shoppingListView.js';

// if (module.hot) {
//   module.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();
    // load recipe

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // Load recipe
    await model.loadRecipe(id);

    // Render recipe

    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // Get search query
    const query = searchView.getQuery();

    if (!query) return;

    // load search results
    await model.loadSearchResults(query);

    // render results

    // resultsView.render(model.state.search.results); all
    resultsView.render(model.getSearchResultsPage(1));

    // Render initial pagination buttons
    paginationView.render(model.state.search);
    //
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings (in state)
  model.updateServings(newServings);

  // update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  // Upload the new recipe data
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);

    // render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (err) {
    console.error('****', err);
    addRecipeView.renderError(err.message);
  } finally {
    // close form window
    setTimeout(function () {
      addRecipeView.hideWindow();
    }, MODAL_CLOSE_SEC * 1000).setTimeout(function () {
      addRecipeView.renderForm();
    }, MODAL_RESET_SEC * 1000);

    // Needs a delay because overlay changes before message fades
  }
};

const controlAddIngredient = function (ingID) {
  model.addIngredient(model.state.recipe.ingredients[ingID].description);
  shoppingListView.render(model.state.shoppingList);
};

const controlShoppingList = function () {
  shoppingListView.render(model.state.shoppingList);
};

const clearShoppingList = function () {
  model.clearShoppingList();
  model.state.shoppingList = [];
  shoppingListView.render(model.state.shoppingList);
};

const removeShoppingListItem = function (itemDescription) {
  console.log('remove item: ' + itemDescription);
  model.removeIngredient(itemDescription);
  shoppingListView.render(model.state.shoppingList);
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerAddIngredient(controlAddIngredient);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);

  shoppingListView.addHandlerClear(clearShoppingList);
  shoppingListView.addHandlerRender(controlShoppingList);
  shoppingListView.addHandlerRemoveItem(removeShoppingListItem);
};

init();
