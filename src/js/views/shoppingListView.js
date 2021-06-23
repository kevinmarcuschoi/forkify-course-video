import View from './View.js';
import icons from 'url:../../img/icons.svg'; // Pacel 2
import previewView from './previewView.js';

class ShoppingListView extends View {
  _parentElement = document.querySelector('.shopping__list');
  _errorMessage = 'No items yet. Find a nice recipe and add ingredients ;)';
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  addHandlerClear(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.clearShoppingList');
      if (!btn) return;
      handler();
    });
  }

  addHandlerRemoveItem(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.buttonRemoveItem');
      if (!btn) return;
      // const itemDescription = btn.parentNode.textContent.slice(1, -2);
      const itemElement = btn.parentNode.parentNode.querySelector(
        '.shoppingItemDescription'
      );
      const itemDescription = itemElement.textContent.slice(1);
      handler(itemDescription);
    });
  }

  _generateMarkup() {
    let markup = this._data
      .map((item, index) => this._generateItemMarkup(item, index))
      .join('');

    markup += '<button class="clearShoppingList">Clear</button>';

    return markup;
  }

  _generateItemMarkup(item) {
    return `
        <div>    
          <input type="checkbox" class="shoppingListControls">
          <h4 class="shoppingItemDescription">・${item}</h4>
          <button class="shoppingListControls buttonRemoveItem">✕</button>
        </div>
      `;
  }
}

export default new ShoppingListView();
