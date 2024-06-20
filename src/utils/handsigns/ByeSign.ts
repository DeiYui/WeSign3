import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from "fingerpose";

export const byeSign = new GestureDescription("Bye");

// Thumb
byeSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
byeSign.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.9);

// Index
byeSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
byeSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);

// Middle
byeSign.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
byeSign.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);

// Ring
byeSign.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
byeSign.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.9);

// Pinky
byeSign.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
byeSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.9);
