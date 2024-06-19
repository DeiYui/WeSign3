import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from "fingerpose";

export const oSign = new GestureDescription("O");

// Thumb (ngón cái)
oSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
oSign.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.7);

// Index (ngón trỏ)
oSign.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
oSign.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.7);

// Middle (ngón giữa)
oSign.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
oSign.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.7);

// Ring (ngón đeo nhẫn)
oSign.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
oSign.addDirection(Finger.Ring, FingerDirection.DiagonalUpRight, 0.7);

// Pinky (ngón út)
oSign.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);
oSign.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.7);
