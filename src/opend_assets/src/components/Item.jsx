import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import {Actor,HttpAgent} from "@dfinity/agent";
import {Principal} from '@dfinity/principal';
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenFactory} from "../../../declarations/token";
import { opend } from "../../../declarations/opend";
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const id=props.id;

  const [name,setName]=useState();
  const [owner,setOwner]=useState();
  const [image,setImage]=useState();
  const [priceInput,setPriceInput]=useState();
  const [getButton,setButton]=useState();
  const [getHidden,setHidden]=useState(true);
  const [blur,setBlur]= useState();
  const [sellStatus,setSellStatus]=useState();
  const [priceLabel,setPriceLabel]=useState();
  const [shouldDisplay,setDisplay]=useState(true);
  
  const localHost = "http://localhost:8080/"
  const agent=new HttpAgent({host:localHost});

  let NFTActor;

  // ToDo : When deploy live, remove this line
  agent.fetchRootKey();
  
  async function loadNFT(){
    NFTActor=await Actor.createActor(idlFactory,{
      agent,canisterId:id
    });

    const nOwner=await NFTActor.getOwner();
    const imageData= await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    const image=URL.createObjectURL(new Blob([imageContent.buffer],{type:"image/png"}));
    const isListed= await opend.isListed(id); 
    
    if(props.role=="discover"){
      const originalOwner= await opend.getOriginalOwner(id);
      
      if(originalOwner.toText()!= CURRENT_USER_ID)
        setButton(<Button handleClick={handleBuy} text="Buy"/>);

      setOwner(nOwner.toText());
      const sellPrice=await opend.getListedNFTPrice(id);
      console.log(sellPrice);
      setPriceLabel(<PriceLabel itemPrice={sellPrice.toString()}/>)
    }
    else if(isListed){
      setBlur({filter:"blur(4px)"});
      setSellStatus("Listed");
      setOwner("openD");
    }
    else{
      setButton(<Button handleClick={handleSell} text="sell"/>);
      setOwner(nOwner.toText());
    }

    setName(await NFTActor.getName());
    setImage(image);
  }

  useEffect(()=>{
    loadNFT();
  },[]);

  let price;

  function handleSell(){
    console.log("clicked");
    setPriceInput(<input
      placeholder="Price in KCON"
      type="number"
      className="price-input"
      value={price}
      onChange={(e)=>price = e.target.value}
    />)
    setButton(<Button handleClick={sellItem} text="confirm"/>);
  }

  async function handleBuy(){
    console.log("Buy was triggered");
    setHidden(false);
    const tokenActor = await Actor.createActor(tokenFactory,{
      agent,
      canisterId : Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai")
    });

    const sellerId= await opend.getOriginalOwner(id);
    const itemPrice=await opend.getListedNFTPrice(id);

    const res=await tokenActor.transferAmount(sellerId,itemPrice);
    console.log(res); 

    if(res=="succsess"){
      const traResult=await opend.copmletePurchase(id,sellerId, CURRENT_USER_ID);
      console.log("purchase: " + traResult);
      setHidden(true);
      setDisplay(false);
    }
  }
  
  async function sellItem(e){
    setHidden(false);
    setBlur({filter:"blur(4px)"});
    console.log("set Price = "+ price);
    const listingResult = await opend.listItem(id,Number(price));
    console.log("Listing: " + listingResult);

    if(listingResult == "Success"){
      const openDId=await opend.getOpenDCanisterId();
      const transferResult = await NFTActor.transferOwership(openDId);
      console.log("transfer: " +transferResult);
      if(transferResult=="Success"){
        setSellStatus("Listed")
        setHidden(true);
        setPriceInput();
        setButton();
        setOwner("openD");
      }
    }
  }

  return (
    <div className="disGrid-item" style={{display: shouldDisplay ? "inline" : "none"}}>
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          style={blur}
          src={image}
        />
        <div className="lds-ellipsis" hidden={getHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner : {owner}
          </p>
          {priceInput}
          {getButton}
        </div>
      </div>
    </div>
  );
}

export default Item;
