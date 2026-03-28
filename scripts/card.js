const cardTemplate = document.querySelector('#card-template').content;

export function createCard(cardData, callbacks, userId) {
  const cardElement = cardTemplate.querySelector('.card').cloneNode(true);
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeButton = cardElement.querySelector('.card__like-button');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const likeCount = cardElement.querySelector('.card__like-count');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes.length;

  // активный лайк если пользователь уже лайкал
  if (cardData.likes.some(user => user._id === userId)) {
    likeButton.classList.add('card__like-button_is-active');
  }

  // кнопка удаления только на своих карточках
  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', () => {
      callbacks.deleteCard(cardData._id, cardElement);
    });
  }

  likeButton.addEventListener('click', () => {
    const isLiked = likeButton.classList.contains('card__like-button_is-active');
    callbacks.likeCard(cardData._id, likeButton, likeCount, isLiked);
  });

  cardImage.addEventListener('click', () => callbacks.openImage(cardData));

  return cardElement;
}

export function removeCardElement(cardElement) {
  cardElement.remove();
}
