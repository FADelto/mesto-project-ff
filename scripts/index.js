import '../pages/index.css';
import logoImage from '../images/logo.svg';
import { createCard, removeCardElement, toggleLike } from './card.js';
import { openModal, closeModal, handleOverlayClose } from './modal.js';
import { enableValidation, clearValidation } from './validation.js';
import { getUser, getCards, updateUser, addCard, removeCard, likeCard, unlikeCard, updateAvatar } from './api.js';

document.querySelector('.header__logo').src = logoImage;

// DOM узлы
const placesList = document.querySelector('.places__list');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');

const editButton = document.querySelector('.profile__edit-button');
const addButton = document.querySelector('.profile__add-button');

const editPopup = document.querySelector('.popup_type_edit');
const newCardPopup = document.querySelector('.popup_type_new-card');
const imagePopup = document.querySelector('.popup_type_image');
const avatarPopup = document.querySelector('.popup_type_edit-avatar');

const editForm = document.forms['edit-profile'];
const nameInput = editForm.querySelector('.popup__input_type_name');
const descriptionInput = editForm.querySelector('.popup__input_type_description');

const newCardForm = document.forms['new-place'];
const cardNameInput = newCardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = newCardForm.querySelector('.popup__input_type_url');

const avatarForm = document.forms['edit-avatar'];
const avatarInput = avatarForm.querySelector('.popup__input_type_url');

const imageElement = imagePopup.querySelector('.popup__image');
const captionElement = imagePopup.querySelector('.popup__caption');

let userId;

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// подстановка текста кнопки при загрузке
function renderLoading(button, isLoading, defaultText = 'Сохранить') {
  button.textContent = isLoading ? 'Сохранение...' : defaultText;
}

// колбэки для карточек
function handleDelete(cardId, cardElement) {
  removeCard(cardId)
    .then(() => removeCardElement(cardElement))
    .catch(err => console.log(err));
}

function handleLike(cardId, likeButton, likeCountElement, isLiked) {
  const request = isLiked ? unlikeCard(cardId) : likeCard(cardId);
  request
    .then(updatedCard => {
      toggleLike(likeButton);
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch(err => console.log(err));
}

function handleImageClick(cardData) {
  imageElement.src = cardData.link;
  imageElement.alt = cardData.name;
  captionElement.textContent = cardData.name;
  openModal(imagePopup);
}

// обработчики форм
function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(submitButton, true);

  updateUser(nameInput.value, descriptionInput.value)
    .then(userData => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModal(editPopup);
    })
    .catch(err => console.log(err))
    .finally(() => renderLoading(submitButton, false));
}

function handleNewCardFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(submitButton, true, 'Создать');

  addCard(cardNameInput.value, cardLinkInput.value)
    .then(newCardData => {
      const card = createCard(newCardData, { deleteCard: handleDelete, likeCard: handleLike, openImage: handleImageClick }, userId);
      placesList.prepend(card);
      newCardForm.reset();
      closeModal(newCardPopup);
    })
    .catch(err => console.log(err))
    .finally(() => renderLoading(submitButton, false, 'Создать'));
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(submitButton, true);

  updateAvatar(avatarInput.value)
    .then(res => {
      profileImage.style.backgroundImage = `url('${res.avatar}')`;
      avatarForm.reset();
      closeModal(avatarPopup);
    })
    .catch(err => console.log(err))
    .finally(() => renderLoading(submitButton, false));
}

// слушатели кнопок
editButton.addEventListener('click', () => {
  nameInput.value = profileTitle.textContent;
  descriptionInput.value = profileDescription.textContent;
  clearValidation(editForm, validationConfig);
  openModal(editPopup);
});

addButton.addEventListener('click', () => {
  newCardForm.reset();
  clearValidation(newCardForm, validationConfig);
  openModal(newCardPopup);
});

profileImage.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModal(avatarPopup);
});

// закрытие попапов по крестику и оверлею
document.querySelectorAll('.popup').forEach(popup => {
  popup.addEventListener('mousedown', handleOverlayClose);
  popup.querySelector('.popup__close').addEventListener('click', () => closeModal(popup));
});

// слушатели форм
editForm.addEventListener('submit', handleEditFormSubmit);
newCardForm.addEventListener('submit', handleNewCardFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFormSubmit);

enableValidation(validationConfig);

// загрузка данных
Promise.all([getUser(), getCards()])
  .then(([userData, cards]) => {
    userId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileImage.style.backgroundImage = `url('${userData.avatar}')`;

    cards.forEach(cardData => {
      const card = createCard(cardData, { deleteCard: handleDelete, likeCard: handleLike, openImage: handleImageClick }, userId);
      placesList.append(card);
    });
  })
  .catch(err => console.log(err));
