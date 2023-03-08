document.addEventListener('DOMContentLoaded', function() {

  class LocalStorage {
    static getItem = function(key) {
      return localStorage.getItem(key);
    };
    static setItem = function(key, value) {
      return localStorage.setItem(key, JSON.stringify(value));
    };
  }

  const productList = document.querySelector(".preview__choice-list"),
    mainContent = document.querySelector(".main-content"),
    Bag = {
      section: document.querySelector("section.bag"),
      openBTN: document.querySelector(".header__nav-bag"),
      closeBTN: document.querySelector(".bag--close"),
      buyList: document.querySelector(".bag__list"),
      total: document.querySelector(".bag__total span"),
      counterBuyList: document.querySelector('.bag__counter'),
      getLocaleStorageAndDisplayBag: function () {
        this.buyList.textContent = "";
        let totalSumm = 0;
        for (let t = 0; t < localStorage.length; t++) {
          let currentKey = localStorage.key(t),
            currentItem = JSON.parse(LocalStorage.getItem(currentKey));
            totalSumm += Number(currentItem.summItem),
            this.buyList.insertAdjacentHTML("beforeend", `<div class="bag__list-item" data-choice-id="${currentKey}">
              <div class="bag__list-item-img-box">
                <img class = "bag__list-item-img" src="${currentItem.imgSrc}" alt="choice images">
              </div>
              <div class="bag__list-item-text">
                <h6>
                  ${currentItem.title}
                </h6>
                <p>
                  $${Number(currentItem.summItem).toFixed(2)}
                </p>
                <button>
                  remove
                </button>
              </div>
              <div class="bag__list-item-quantity">
                <button class="bag__list-item-quantity--add">
                  &#8743
                </button>
                <p class="bag__list-item-quantity--current">
                  ${currentItem.quantity}
                </p>
                <button class="bag__list-item-quantity--remove">
                  &#8744
                </button>
              </div>
            </div>`)
        }
        this.total.innerHTML = totalSumm.toFixed(2)
        this.counterBuyList.textContent = localStorage.length;
      },
      changeQuantity: function (t, e, i) {
        e.innerHTML = i,
          (e = JSON.parse(LocalStorage.getItem(t.dataset.choiceId))).quantity = i,
          e.summItem = e.price * e.quantity,
          LocalStorage.setItem(t.dataset.choiceId, e),
          this.getLocaleStorageAndDisplayBag()
      },
      open: function () {
        this.section.style.transform = "translateX(0)",
          this.section.style.overflowY = "scroll",
          this.section.classList.add("bag-status--open"),
          document.querySelector("body").style.overflowY = "hidden",
          mainContent.style.filter = "grayscale(0.7)";
          mainContent.style.pointerEvents = "none"
        },
        close: function () {
          this.section.classList.remove("bag-status--open"),
          this.section.style.transform = "translateX(100%)",
          document.querySelector("body").style.overflowY = "visible",
          mainContent.style.filter = "grayscale(0)";
          mainContent.style.pointerEvents = "auto"
      }
    };
  
  const Filter = {
    search: document.querySelector('.products__search'),
    checkboxList: document.querySelector('.products__form-checkbox-list'),
    range: document.querySelector('.products__form-range'),
    rangeValue: document.querySelector('.products__form-range-value'),
    allCheckboxChecked: (allCheckbox, activeCounter, e) => {
      allCheckbox.forEach(i => {
        i.classList.remove('active');
      });  
      document.querySelector('.products__form-checkbox-inner[data-name-company="all"]').classList.add('active');
      activeCounter = 0;
    },
    displayResultItem: function() {
      let value = Filter.search.value.toLowerCase();
      let activeCheckbox = [...Filter.checkboxList.querySelectorAll('.products__form-checkbox-inner.active')];
      let rangeValues = [document.getElementById('min'), document.getElementById('max')];
      const allItems = [...productList.querySelectorAll('.preview__choice-item')];
      
      const searchResultForText = allItems.filter(function(item) {
        return item.querySelector('.preview__choice-item-title').textContent.match(new RegExp(value, "i"));
      });
      const searchResultForCheckbox = searchResultForText.filter(function(item) {
        for (let i = 0; i < activeCheckbox.length; i++) {
          if (item.dataset.nameCompany == activeCheckbox[i].dataset.nameCompany) {
            return item;
          } else if (activeCheckbox[i].dataset.nameCompany == 'all') {
            return item;
          }
          // return item.dataset.nameCompany == activeCheckbox[i].dataset.nameCompany || activeCheckbox[i].dataset.nameCompany == 'all';
        }      
      });
      const searchResultFinal = searchResultForCheckbox.filter(item => {
        let currentPrice = Number(item.querySelector('.preview__choice-item-price').textContent.slice(1));
        return Number(rangeValues[0].textContent) <= currentPrice && currentPrice <= Number(rangeValues[1].textContent);
      });
  
      allItems.forEach(i => {
        i.style.display = 'none';
      });
      searchResultFinal.forEach(i => {
        i.style.display = 'flex';
      });
    }
  };
  
  (function () {
    let priceBeforeFormatting = document.querySelectorAll(".preview__choice-item-price, .bag__list-item-text p, .bag__total span");
    const PRICESTYLE = {
      style: "currency",
      currency: "USD",
      fractionDigits: 2
    };
    priceBeforeFormatting.forEach(t => {
        let priceAfterFormatting = Number(t.textContent).toLocaleString("en-US", PRICESTYLE);
        t.innerHTML = priceAfterFormatting
      }),
    Bag.getLocaleStorageAndDisplayBag();
    document.querySelector('.products__form-checkbox-list .products__form-checkbox-inner[data-name-company="all"]')?.setAttribute('checked', 'true');
  })(),
  
  productList && productList.addEventListener("click", function (t) {
      let e, i, a;
      t.target.closest(".preview__choice-item-img-btn") && (e = (t = t.target.closest(".preview__choice-item")).dataset.choiceId,
        a = t.querySelector(".preview__choice-item-img").getAttribute("src"),
        i = t.querySelector(".preview__choice-item-title").textContent.trim(),
        t = t.querySelector(".preview__choice-item-price").textContent.slice(1),
        a = {
          imgSrc: a,
          title: i,
          price: Number(t),
          quantity: 1,
          summItem: +Number(t)
        },
        LocalStorage.getItem(e) || LocalStorage.setItem(e, a),
        Bag.getLocaleStorageAndDisplayBag(),
        Bag.open())
    }),
    Bag.closeBTN.addEventListener("click", function () {
      Bag.close()
    }),
    mainContent.addEventListener("click", function (t) {
      t.target.closest(".header__nav-bag") || t.target.closest(".preview__choice-item-img-btn") ? Bag.open() : Bag.close()
    }),
    Bag.buyList.addEventListener("click", function (t) {
      let e = t.target.closest(".bag__list-item"),
        i = e.querySelector(".bag__list-item-text button"),
        a = e.querySelector(".bag__list-item-quantity--add"),
        o = e.querySelector(".bag__list-item-quantity--remove"),
        n = e.querySelector(".bag__list-item-quantity--current");
      let c = Number(n.textContent);
      i == t.target && (localStorage.removeItem(e.dataset.choiceId),
          e.remove(),
          Bag.getLocaleStorageAndDisplayBag()),
        a == t.target && (10 <= ++c && (c = 10),
          Bag.changeQuantity(e, n, c)),
        o == t.target && (--c < 1 && (c = 1),
          Bag.changeQuantity(e, n, c))
    });
  
  Filter.search?.addEventListener('input', Filter.displayResultItem);
  
  Filter.checkboxList?.addEventListener('click', function(e) {
    const allCheckbox = document.querySelectorAll('.products__form-checkbox-list .products__form-checkbox-inner');
    let activeCounter = 0;
    
    if (e.target.closest('.products__form-checkbox-inner[data-name-company="all"]')) {
      Filter.allCheckboxChecked(allCheckbox, activeCounter, e);
    } else {
      document.querySelector('.products__form-checkbox-inner[data-name-company="all"]').classList.remove('active');
      e.target.classList.toggle('active');
    }
    
    allCheckbox.forEach(i => {
      i.classList.contains('active') && activeCounter++;
    });
    
    activeCounter === 0 && document.querySelector('.products__form-checkbox-inner[data-name-company="all"]').classList.add('active');
      
    activeCounter === 4 && Filter.allCheckboxChecked(allCheckbox, activeCounter);
  
    Filter.displayResultItem();
  });
  
  Filter.range && noUiSlider.create(Filter.range, {
      start: [0, 100],
      connect: false,
      step: 10,
      margin: 10,
      range: {
          'min': 0,
          'max': 100
      }
  });
  
  Filter.range?.noUiSlider.on('slide', function(value, handle) {
    handle == 0 ? Filter.rangeValue.querySelector('#min').innerHTML = Math.round(Number(value[0])) : Filter.rangeValue.querySelector('#max').innerHTML = Math.round(Number(value[1]));
  
    Filter.displayResultItem();
  });

});
