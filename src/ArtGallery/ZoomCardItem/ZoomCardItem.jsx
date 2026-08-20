import React, { useState, useEffect, useCallback } from "react";
import "./zoom-card-item.css";

export const ZoomCardItem = (props) => {
  const card = props.card;

  const [search, setSearch] = useState("");

  // Recieve search data from Search component, init search state
  const recieveTagText = useCallback(
    (childProps) => {
      // Update searched text in the state
      setSearch(childProps);

      // Update the parent's props {handleNavSearch} with the search text
      // (ArtGallery component - Search grandparent component)
      props.handleTagSearch(childProps);
    },
    [] //search
  );

  const tagsList = createTagsList(card.tags, recieveTagText);

  return (
    <div className="zoom-container">
      <ZoomImage card={card} />
      <div id="detailsContainer" className="details-container">
        <p id="title" className="title">
          {card.title}
        </p>
        <hr />
        <p id="description">{card.description}</p>
        <p id="date" className="date">
          – {card.date}
        </p>
        <ul>{tagsList}</ul>
        <div className="likes-container">
          <Like card={card} />
          <Dislike card={card} />
        </div>
      </div>
    </div>
  );
};

function createTagsList(tags, recieveTagText) {
  let tagsList = tags.map((i) => (
    <Tag currentTag={i} key={i} handleTagSearch={recieveTagText} />
  ));
  return tagsList;
}

function Tag(props) {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState(props.currentTag.toString());

  function updateSearch(event) {
    event.preventDefault();

    // Get the search text when occurs event 'onChange'
    setSearch(tag);

    // Update the parent's props {handleSearch} with the search text
    props.handleTagSearch(tag);
  }

  return (
    <li className="tag" onClick={updateSearch}>
      #{tag}
    </li>
  );
}

function ZoomImage(props) {
  let card = props.card;
  return (
    <div id="imageContainer" className="image-container">
      {/* <TransformWrapper> */}
      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <React.Fragment>
          <div className="image-wrapper">
            <img
              id="image"
              className="image"
              src={card.imgURL}
              alt={card.title}
            />
          </div>
          <div className="tools">
            <button className="zoom-in-btn" onClick={zoomIn}>
              <i className="fas fa-search-plus zoom-in-icon" />
            </button>
            <button className="zoom-out-btn" onClick={zoomOut}>
              <i className="fas fa-search-minus zoom-out-icon" />
            </button>
            <button className="zoom-reset-btn" onClick={resetTransform}>
              <i className="fas fa-expand zoom-reset-icon" />
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
