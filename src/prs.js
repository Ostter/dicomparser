import { uids } from "./uids";
import { TAG_DICT } from "./dataDictionary";

let maxLength = 128;

// helper function to see if a string only has ascii characters in it
function isASCII(str) {
  return /^[\x00-\x7F]*$/.test(str);
}

function mapUid(str) {
  let uid = uids[str];
  if (uid) {
    return " [ " + uid + " ]";
  }
  return "";
}

//read only this tags
const arrayTags = [
  "x30060016",
  "x30060039",
  "x30060040",
  "x30060042",
  "x30060046",
  "x30060050",
  "x00081150",
  "x00081155"
];

// This function iterates through dataSet recursively and adds new tag
// to the output array passed into it
export function dumpDataSet(dataSet, output) {
  function getTag(tag) {
    let group = tag.substring(1, 5);
    let element = tag.substring(5, 9);
    let tagIndex = ("(" + group + "," + element + ")").toUpperCase();
    return TAG_DICT[tagIndex];
  }

  function stringToTripleArray(str) {
    let arrayCoord = str.replace(/['"]/g, "").split("\\");
    let coords = [];
    let trinityCoords = [];
    let i = 0;
    arrayCoord.forEach(el => {
      i++;
      coords.push(parseFloat(el));
      if (i === 3) {
        trinityCoords.push(coords);
        i = 0;
        coords = [];
      }
    });
    return trinityCoords;
  }

  try {
    let keys = [];
    for (let propertyName in dataSet.elements) {
      if (arrayTags.includes(propertyName)) {
        keys.push(propertyName);
      }
    }

    // the dataSet.elements object contains properties for each element parsed.  The name of the property
    // is based on the elements tag and looks like 'xGGGGEEEE' where GGGG is the group number and EEEE is the
    // element number both with lowercase hexadecimal letters.  For example, the Series Description DICOM element 0008,103E would
    // be named 'x0008103e'.  Here we iterate over each property (element) so we can build a string describing its
    // contents to add to the output array
    for (let k = 0; k < keys.length; k++) {
      let propertyName = keys[k];
      let element = dataSet.elements[propertyName];

      let arrayStr = {};
      let payload = "";

      let tag = getTag(element.tag);
      // The output string begins with the element name (or tag if not in data dictionary), length and VR (if present).  VR is undefined for
      // implicit transfer syntaxes
      if (tag !== undefined) {
        arrayStr["tag"] = element.tag;
        arrayStr["tagName"] = tag.name;
      }

      // Here we check for Sequence items and iterate over them if present.  items will not be set in the
      // element object for elements that don't have SQ VR type.  Note that implicit little endian
      // sequences will are currently not parsed.
      if (element.items) {
        // each item contains its own data set so we iterate over the items
        // and recursively call this function
        element.items.forEach(item => {
          dumpDataSet(item.dataSet, output);
        });
      } else if (element.fragments) {
      } else {
        // use VR to display the right value
        let vr;
        if (element.vr !== undefined) {
          vr = element.vr;
        } else {
          if (tag !== undefined) {
            vr = tag.vr;
          }
        }

        // Since the dataset might be encoded using implicit transfer syntax and we aren't using
        // a data dictionary, we need some simple logic to figure out what data types these
        // elements might be.  Since the dataset might also be explicit we could be switch on the
        // VR and do a better job on this, perhaps we can do that in another example
        // First we check to see if the element's length is appropriate for a UI or US VR.
        // US is an important type because it is used for the
        // image Rows and Columns so that is why those are assumed over other VR types.
        if (element.vr === undefined && tag === undefined) {
        } else {
          function isStringVr(vr) {
            if (
              vr === "AT" ||
              vr === "FL" ||
              vr === "FD" ||
              vr === "OB" ||
              vr === "OF" ||
              vr === "OW" ||
              vr === "SI" ||
              vr === "SQ" ||
              vr === "SS" ||
              vr === "UL" ||
              vr === "US"
            ) {
              return false;
            }
            return true;
          }
          if (isStringVr(vr)) {
            // Next we ask the dataset to give us the element's data in string form.  Most elements are
            // strings but some aren't so we do a quick check to make sure it actually has all ascii
            // characters so we know it is reasonable to display it.
            let str = dataSet.string(propertyName);
            let stringIsAscii = isASCII(str);
            if (stringIsAscii) {
              // the string will be undefined if the element is present but has no data
              // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
              // data.  Note that the length of the element will be 0 to indicate "no data"
              // so we don't put anything here for the value in that case.
              if (str !== undefined) {
                payload += '"' + str + '"' + mapUid(str);
              }
            } else {
              if (element.length !== 2 && element.length !== 4) {
                // If it is some other length and we have no string
              }
            }
          }
        }

        //if the value of tag is coordinates, we split into triples them
        if (element.length > maxLength) {
          payload = stringToTripleArray(payload);
        }

        // finally we add the value of the tag to our output array
        arrayStr["payload"] = payload;
        output.push(arrayStr);
      }
    }
  } catch (err) {
    let ex = {
      exception: err,
      output: output
    };
    throw ex;
  }
}
