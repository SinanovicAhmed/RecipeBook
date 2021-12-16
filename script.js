const moreIcon = document.querySelector(".more-icon");
const moreBox = document.querySelector(".more-box");
const searchBtn = document.querySelector(".search-button");
const minCalories = document.querySelector(".calorie-input1");
const maxCalories = document.querySelector(".calorie-input2");
const searchBar = document.querySelector(".search-bar");
const displayRecipies = document.querySelector(".display-recepies");
const inDepthOverview = document.querySelector(".in-depth-overview");
const overview_mealName = document.querySelector(".in-depth-overview__name");
const overview_mealImage = document.querySelector(".in-depth-overview__image");
const overview_Serving = document.querySelector(".in-depth-overview__servings");
const overview_calories = document.querySelector(".nutrition__calories");
const overview_carbs = document.querySelector(".nutrition__carbs");
const overview_protein = document.querySelector(".nutrition__protein");
const overview_fat = document.querySelector(".nutrition__fat");
const overview_text = document.querySelector(".in-depth-overview__text");
const overview_caution = document.querySelector(".caution");
const overview_link = document.querySelector(".link");
const save_favourites = document.querySelector(".add-to-favourites");
const show_favourites = document.querySelector(".favourite-recepies");
const show_favourites_box = document.querySelector(
  ".display-favourite-recepies"
);
const favourites_main = document.querySelector(".favourite-main");
//FUNCTIONS-------------------------------------------------------

let favouriteRecepies = [];

if (localStorage.getItem("array"))
  favouriteRecepies = JSON.parse(localStorage.getItem("array"));

console.log(favouriteRecepies);

function renderFavouriteRecepies(array) {
  favourites_main.innerHTML = "";
  let noFavourites =
    "<br>No favourite recipes.<br>To save your favourite recipe click on recipe you like and use Add to favourite button.<br><br>";
  if (array.length == 0) {
    favourites_main.insertAdjacentHTML("beforeEnd", noFavourites);
  }
  for (let i = 0; i < array.length; i++) {
    let temp = `<div class="favourite-element">
      <div class="name">${array[i].name}</div>
      <a href="${array[i].link}" target="_blank" class="favourite-link">${array[i].link}</a>
      <div class="remove" onclick=removeFavourite(${i})>Remove</div>
     </div>`;

    favourites_main.insertAdjacentHTML("beforeEnd", temp);
  }
}

function removeFavourite(index) {
  console.log(index);
  favouriteRecepies.splice(index, 1);
  localStorage.setItem("array", JSON.stringify(favouriteRecepies));
  renderFavouriteRecepies(favouriteRecepies);
}

function calculatingCalorieRange() {
  let fetchTemp;
  if (minCalories.value == "" && maxCalories.value == "") {
    fetchTemp = ``; // if nothing is writen in min max calories basicly no restrictions
  } else if (minCalories.value == "" && maxCalories.value != "") {
    fetchTemp = `&calories=1-${maxCalories.value}`; //if only max is set min is set to 0 calories
    minCalories.value = 0;
  } else if (minCalories.value != "" && maxCalories.value == "") {
    fetchTemp = `&calories=${minCalories.value}-99999`; //if only min is set max is set to unlimited
  } else {
    fetchTemp = `&calories=${minCalories.value}-${maxCalories.value}`;
  }
  return fetchTemp;
}

function HTMLstring(data, i) {
  let tempIngridientString = "";
  for (let j = 0; j < data[i].recipe.ingredientLines.length; j++) {
    tempIngridientString += data[i].recipe.ingredientLines[j] + "<br>";
  }
  let string = `<div class="meal" id="${data[i]._links.self.href}" onClick = fetchSpecific("${data[i]._links.self.href}")>
    <div class="meal-image" id="${i}"></div>
    <div class = "overview">
      <div class="meal-name">${data[i].recipe.label}</div>
      <div class="meal-overview">${tempIngridientString}</div>
    </div>
  </div>`;
  return string;
}
function searchOption() {
  let calorieRange = calculatingCalorieRange();
  if (searchBar.value == "") {
    searchBar.style.borderColor = "red";
  } else {
    searchBar.style.border = "solid #6f5e53 1px";
    fetchFunction(calorieRange, searchBar.value);
    searchBar.value = "";
    minCalories.value = maxCalories.value = "";
    setTimeout(() => {
      displayRecipies.scrollIntoView({ behavior: "smooth" });
    }, 1000);
  }
}

//in-depth-overview
function fetchSpecific(divId) {
  show_favourites_box.style.display = "none"; // close favourite tab if its open when you open recipe
  fetch(`${divId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      let tempIngridientString = "";
      for (let j = 0; j < data.recipe.ingredientLines.length; j++) {
        tempIngridientString += data.recipe.ingredientLines[j] + "<br>";
      }
      inDepthOverview.style.display = "flex";
      overview_mealName.innerHTML = `${data.recipe.label}`;
      overview_mealImage.style.backgroundImage = `url(${data.recipe.image})`;
      overview_Serving.innerHTML = `Servings: ${data.recipe.yield}`;
      overview_calories.innerHTML = `Calories: ${Math.floor(
        data.recipe.totalNutrients.ENERC_KCAL.quantity
      )} kcal`;
      overview_carbs.innerHTML = `Carbs: ${
        Math.round(data.recipe.totalNutrients.CHOCDF.quantity * 10) / 10
      } g`;
      overview_protein.innerHTML = `Protein: ${
        Math.round(data.recipe.totalNutrients.PROCNT.quantity * 10) / 10
      } g`;
      overview_fat.innerHTML = `Fat: ${
        Math.round(data.recipe.totalNutrients.FAT.quantity * 10) / 10
      } g`;

      overview_text.innerHTML = `${tempIngridientString}`;
      overview_caution.innerHTML = `Caution: ${data.recipe.cautions}`;
      overview_link.href = `${data.recipe.url}`;
      overview_link.innerHTML = `${data.recipe.url}`;
    });
}

function fetchFunction(fetchTemp, recipeName) {
  fetch(
    `https://api.edamam.com/api/recipes/v2?type=public&q=${recipeName}&app_id=10c2aa78&app_key=ec980e71190a3627af35131628d7d4da${fetchTemp}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      displayRecipies.innerHTML = "";
      //proslijedi data.hits
      if (data.hits.length == 0) {
        displayRecipies.insertAdjacentHTML(
          "beforeEnd",
          `<div class="no-hits">Nothing found</div>`
        );
      } else {
        for (let i = 0; i < data.hits.length; i++) {
          let temp = HTMLstring(data.hits, i);
          let tempImage = data.hits[i].recipe.image;

          if (tempImage) {
            displayRecipies.insertAdjacentHTML("beforeEnd", temp);
            document.getElementById(
              `${i}`
            ).style.backgroundImage = `url(${tempImage})`;
          }
        }
      }
    });
}

//EVENT LISTENERS ----------------------------------------------
moreIcon.addEventListener("click", () => {
  if (moreBox.style.display == "none") {
    moreBox.style.display = "flex";
    moreIcon.style.transform = "rotate(180deg)";
  } else {
    moreBox.style.display = "none";
    moreIcon.style.transform = "rotate(360deg)";
  }
});

searchBtn.addEventListener("click", () => {
  searchOption();
});

document.addEventListener("keypress", (e) => {
  if (e.key == "Enter" && searchBar.value != "") searchOption();
});

document
  .querySelector(".close-in-depth-overview")
  .addEventListener("click", () => {
    inDepthOverview.style.display = "none";
  });

save_favourites.addEventListener("click", () => {
  let temp = {
    name: overview_mealName.innerHTML,
    link: overview_link.innerHTML,
  };

  if (favouriteRecepies.length == 0) {
    favouriteRecepies.push(temp);
    localStorage.setItem("array", JSON.stringify(favouriteRecepies));
  } else {
    for (let i = 0; i < favouriteRecepies.length; i++) {
      console.log(favouriteRecepies[i] === temp);
      if (favouriteRecepies[i].name === temp.name) {
        return;
      }
    }
    favouriteRecepies.push(temp);
    localStorage.setItem("array", JSON.stringify(favouriteRecepies));
  }
});
show_favourites.addEventListener("click", () => {
  console.log(favouriteRecepies);
  renderFavouriteRecepies(favouriteRecepies);
  inDepthOverview.style.display = "none";
  show_favourites_box.style.display = "flex";
});

document.querySelector(".close-favourites").addEventListener("click", () => {
  show_favourites_box.style.display = "none";
});
