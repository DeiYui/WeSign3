import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from "fingerpose";

export const helloSign = new GestureDescription("Hello");

// Thumb
helloSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
helloSign.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1);

// Index
helloSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
helloSign.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1);

// Middle
helloSign.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
helloSign.addDirection(Finger.Middle, FingerDirection.HorizontalRight, 1);

// Ring
helloSign.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
helloSign.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1);

// Pinky
helloSign.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
helloSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1);
