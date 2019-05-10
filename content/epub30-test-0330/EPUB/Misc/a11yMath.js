// Test if MathML is supported by Reading System
// This is a hueristic:
// There are probably cases where this should return false because the screen readers we
//   know about (NVDA, JAWS, VoiceOver, TalkBack, ChomeVox) all handle MathML.
// So the basic assumption is that MathML is accessible if JS runs.
// Cases where this isn't true:
//		Linux (Orca now supports this)
//		Edge -- uses UIA, and that doesn't expose MathML
//		?? Non Safari on MacOS
function CanUseMathML() {
	var isLinux = function(){
		var matches = window.navigator.userAgent.match(/Linux/);
		return (matches!=null && matches.length==1);
	}
	var isEdge = function(){
		var matches = window.navigator.userAgent.match(/Edge\/\d+/);
		return (matches!=null);
	};
	return !isEdge();
}

/* ScreenReaderSpeak(text, priority)
  text: the message to be vocalised
  priority (non mandatory): "polite" (by default) or "assertive" */          

function ScreenReaderSpeak(text, priority) {
    var el = document.createElement("div");
    var id = "speak-" + Date.now();
    el.setAttribute("id", id);
    el.setAttribute("aria-live", priority || "polite");            
    el.classList.add("MathMLNoDisplay");
    document.body.appendChild(el);

    window.setTimeout(function () {
      document.getElementById(id).innerHTML = text;      
    }, 100);

    window.setTimeout(function () {
        document.body.removeChild(document.getElementById(id));
    }, 1000);
}

function CopyToClipboard(buttonElement, containerId) 
{
     var range = document.createRange();
     range.selectNode(document.getElementById(containerId));
     var docFragment = range.cloneContents ();
 
     var tempDiv = document.createElement ("div");
     tempDiv.appendChild (docFragment);
    
     var selected =            
       document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;  
     
     var tempTextArea = document.createElement('textarea'); 
     tempTextArea.value = tempDiv.innerHTML;
        //Prevent visual and screen reader access to this temp textarea
        tempTextArea.setAttribute('readonly', '');
        tempTextArea.style.position = 'absolute';
        tempTextArea.style.left = '-9999px';
        tempTextArea.setAttribute("aria-hidden", "true");

     document.body.appendChild(tempTextArea); 
     tempTextArea.select(); //Select the text inside this hidden textarea
    
     document.execCommand("copy"); //Copy the selected text to the Clipboard
   
     var previousText = buttonElement.innerHTML;
     var copiedText = 'Math copied';
     ScreenReaderSpeak(copiedText, "assertive"); //Speak 'math copied to clipboard'
     buttonElement.innerHTML  = copiedText; //Set text of button to what is spoken for consistency
     window.setTimeout(function () 
     {
        buttonElement.innerHTML = previousText;
     }, 2000);
    
     document.body.removeChild(tempTextArea);  //Remove temp textarea
    
      if (selected) {                                 // If a selection existed before copying
            document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
            document.getSelection().addRange(selected);   // Restore the original selection
        }

};

// ForFach method for working on a nodelist as opposed to the built-in one for arrays
// IMHO, this makes for cleaner code
function ForEach(nodeList, callback, scope) {
  for (var i = 0; i < nodeList.length; i++) {
	 callback(nodeList[i]); // passes back stuff we need
  }
};

// Note: in HTHML, tag and attribute names are case-insensitive; in XHTML, they are case-sensitive
// Class names are case-sensitive in HTML, but not CSS.
function MakeMathAccessible() {
	if (!CanUseMathML())
		return;
		
	var setARIAHidden = function(element) {
		element.setAttribute("aria-hidden", "true");
	};
	var unsetARIAHidden = function(element) {
		element.removeAttribute("aria-hidden");		// use remove rather than unset due to NVDA/IE bug
	};
	var changeImage = function(element) {
		element.setAttribute("alt", "");
		element.setAttribute("aria-hidden", "true");
	};

	var unsetHiddenSummary = function(element) {
        element.style.display = 'block';
	};
    
	var changeMathSpanIfRequired = function(element) {
		if (element.getAttribute("role")=="math") {
			element.setAttribute("aria-hidden", "true");
		}
		if (element.getAttribute("class") && 
			element.getAttribute("class").indexOf("MathMLNoDisplay") >=0) {
			element.parentNode.removeChild(element)
		}
	};
	
	ForEach( document.getElementsByClassName("MathMLNoJavaHidden"), unsetARIAHidden );
	ForEach( document.getElementsByClassName("MathImageNoSR"), changeImage );
    
 	ForEach( document.getElementsByClassName("HideSummaryOfMath"), unsetHiddenSummary );
   
	
	// used for HTML math case to remove the text from AT to avoid double speak
	ForEach( document.getElementsByTagName("span"), changeMathSpanIfRequired );
	
	// make sure MathJax CSS math is hidden, not needed for properly done pages
	ForEach( document.getElementsByClassName("MathJax"), setARIAHidden );
}
