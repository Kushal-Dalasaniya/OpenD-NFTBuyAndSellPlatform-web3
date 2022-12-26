import React, { useEffect,useState } from "react";
import Item from "./Item";
import { opend } from "../../../declarations/opend";
import {Principal} from '@dfinity/principal';
import CURRENT_USER_ID from "../index";

function Gallery(props) {

  const [items,setItems]=useState();

  async function fetchNFTs(){
    const userNFTIds=props.ids;
    
    if(userNFTIds!=undefined){
      setItems(userNFTIds.map(imd => <Item id={imd} key={imd.toText()} role={props.role}/>));
    }

  }

  useEffect(()=>{
    fetchNFTs();
  },[]);
  
  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
