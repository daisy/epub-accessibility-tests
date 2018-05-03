// Test if MathML is supported by Reading System
// This is a hueristic:
// There are probably cases where this should return false because the screen readers we
//   know about (NVDA, JAWS, VoiceOver, TalkBack, ChomeVox) all handle MathML.
// So the basic assumption is that MathML is accessible if JS runs.
// Cases where this isn't true:
//		Linux (none of the above screen readers work there)
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
	return !isLinux() && !isEdge();
}


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
	
	// used for HTML math case to remove the text from AT to avoid double speak
	ForEach( document.getElementsByTagName("span"), changeMathSpanIfRequired );
	
	// make sure MathJax CSS math is hidden, not needed for properly done pages
	ForEach( document.getElementsByClassName("MathJax"), setARIAHidden );
}
