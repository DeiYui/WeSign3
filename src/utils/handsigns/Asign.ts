// gestures.js
import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from "fingerpose";

// Define the "A" gesture
export const aSign = new GestureDescription("A");

// Thumb
aSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aSign.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);

// Index
aSign.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
aSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

// Middle
aSign.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
aSign.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);

// Ring
aSign.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
aSign.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);

// Pinky
aSign.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
aSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);

export default aSign;
