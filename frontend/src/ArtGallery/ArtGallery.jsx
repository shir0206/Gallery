import React, { useState, useCallback, useEffect } from "react";
import { db, storage } from "../Firebase/firebase";

import { Nav } from "./Nav/Nav";
import { Gallery } from "./Gallery/Gallery";
import { FloatingArrow } from "./FloatingArrow/FloatingArrow";
import { ZoomCardItem } from "./ZoomCardItem/ZoomCardItem";

import "./art-gallery.css";

export const ArtGallery = (props) => {
  const [lock, setLock] = useState(false);
  const [search, setSearch] = useState("");
  const [card, setCard] = useState([]);
  const [wide, setWide] = useState(false);

  useEffect(
    () => {
      if (props.windowWidth < 501) {
        console.log("narrow");
        setWide(false);
      } else {
        console.log("wide");
        setWide(true);
      }
    },
    [props.windowWidth] // Occurs when the state within is changing
  );

  // Recieve search data from Nav component, init search state
  const recieveNavSearchText = useCallback(
    (props) => {
      // Update searched text in the state
      setSearch(props);
    },
    [] //search
  );

  const recieveTagSearchText = useCallback(
    (props) => {
      // Update searched text in the state

      setLock(false);

      setSearch(props.toLowerCase());
    },
    [] //search
  );

  const recieveCardDetails = useCallback((propsChild) => {
    let cardId = propsChild.id;
    console.log("from recieveCardDetails", cardId);

    recieveCardFromDB(cardId);
  }, []);

  async function recieveCardFromDB(cardId) {
    try {
      // 1. Fetch a single document by ID from the "Cards" collection
      const docRef = doc(db, "Cards", cardId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const card = { id: docSnap.id, ...docSnap.data() };
        setCard(card);
        setLock(true);
      } else {
        console.log("No such card found!");
        setCard({});
      }
    } catch (error) {
      console.error("Error fetching card: ", error);
    }
  }

  useEffect(() => {
    async function fetchAllCards() {
      try {
        // 2. Fetch all documents inside the "Cards" collection
        const querySnapshot = await getDocs(collection(db, "Cards"));
        const dataJSON = {};

        // Convert Firestore documents into key-value map or array
        querySnapshot.forEach((doc) => {
          dataJSON[doc.id] = doc.data();
        });

        // Initialize state
        setCardItemsData(dataJSON);
      } catch (error) {
        console.error("Error fetching cards collection: ", error);
      }
    }

    fetchAllCards();
  }, []);

  const recieveTagText = useCallback(
    (childProps) => {
      // Update searched text in the state
      setSearch(childProps);

      // Update the parent's props {handleNavSearch} with the search text
      props.handleTagSearch(childProps);
    },
    [props] // Added props dependency for clean React hooks compliance
  );

  return (
    <div id="ArtGallery" className="wide-art-gallery">
      <div
        className={
          lock
            ? wide
              ? "art-gallery-background avoid-clicks"
              : "art-gallery-background avoid-clicks no-scroll"
            : ""
        }
      >
        <Nav search={search} handleNavSearch={recieveNavSearchText} />
        <Gallery
          search={search}
          handleGalleryClickedCard={recieveCardDetails}
        />
        {/* {wide && lock && <ScrollLock />} */}
      </div>

      {card === undefined || card.length === 0 || !lock ? (
        <FloatingArrow />
      ) : (
        <div className={wide ? "zoom-card-wide" : "zoom-card-narrow"}>
          <i
            className="fas fa-times exit-icon"
            onClick={() => setLock(false)}
          />
          <ZoomCardItem card={card} handleTagSearch={recieveTagSearchText} />
        </div>
      )}
    </div>
  );
};
