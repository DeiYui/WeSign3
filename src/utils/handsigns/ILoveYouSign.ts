import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from "fingerpose";

export const iLoveYouSign = new GestureDescription("I LOVE YOU");

// Thumb
iLoveYouSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
iLoveYouSign.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1);

// Index
iLoveYouSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
iLoveYouSign.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1);

// Middle
iLoveYouSign.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
iLoveYouSign.addDirection(Finger.Middle, FingerDirection.HorizontalRight, 0.5);

// Ring
iLoveYouSign.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
iLoveYouSign.addDirection(Finger.Ring, FingerDirection.HorizontalRight, 0.5);

// Pinky
iLoveYouSign.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
iLoveYouSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1);
