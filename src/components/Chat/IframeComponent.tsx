"use client";
import React from "react";

const IframeComponent = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="https://wesign.metered.live/we-sign"
        title="Metered We-Sign"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        allow="camera; microphone"
      />
    </div>
  );
};

export default IframeComponent;
