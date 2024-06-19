import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from "fingerpose";

export const eSign = new GestureDescription("E");
// [
//     [
//       "Thumb",
//       "Half Curl",
//       "Vertical Up"
//     ],
//     [
//       "Index",
//       "Half Curl",
//       "Diagonal Up Right"
//     ],
//     [
//       "Middle",
//       "Full Curl",
//       "Vertical Up"
//     ],
//     [
//       "Ring",
//       "Full Curl",
//       "Vertical Up"
//     ],
//     [
//       "Pinky",
//       "Full Curl",
//       "Vertical Up"
//     ]
//   ]

eSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
eSign.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1.0);
eSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
eSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
eSign.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
eSign.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
eSign.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
eSign.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
eSign.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
eSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
