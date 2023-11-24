!(function () {
  "use strict";
  var l = window.location,
    i = window.document,
    o = i.currentScript,
    c = o.getAttribute("data-api") || new URL(o.src).origin + "/api/event";
  function u(t, e) {
    t && console.warn("Ignoring Event: " + t), e && e.callback && e.callback();
  }
  function t(t, e) {
    if (
      /^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(l.hostname) ||
      "file:" === l.protocol
    )
      return u("localhost", e);
    if (
      window._phantom ||
      window.__nightmare ||
      window.navigator.webdriver ||
      window.Cypress
    )
      return u(null, e);
    try {
      if ("true" === window.localStorage.plausible_ignore)
        return u("localStorage flag", e);
    } catch (t) {}
    var n = {},
      t =
        ((n.n = t),
        (n.u = e && e.u ? e.u : l.href),
        (n.d = o.getAttribute("data-domain")),
        (n.r = i.referrer || null),
        e && e.meta && (n.m = JSON.stringify(e.meta)),
        e && e.props && (n.p = e.props),
        o.getAttributeNames().filter(function (t) {
          return "event-" === t.substring(0, 6);
        })),
      r = n.p || {},
      a =
        (t.forEach(function (t) {
          var e = t.replace("event-", ""),
            t = o.getAttribute(t);
          r[e] = r[e] || t;
        }),
        (n.p = r),
        new XMLHttpRequest());
    a.open("POST", c, !0),
      a.setRequestHeader("Content-Type", "text/plain"),
      a.send(JSON.stringify(n)),
      (a.onreadystatechange = function () {
        4 === a.readyState && e && e.callback && e.callback();
      });
  }
  var e = (window.plausible && window.plausible.q) || [];
  window.plausible = t;
  for (var n = 0; n < e.length; n++) t.apply(this, e[n]);
  var s = 1;
  function r(t) {
    var e, n, r, a, i;
    function o() {
      r || ((r = !0), (window.location = n.href));
    }
    ("auxclick" === t.type && t.button !== s) ||
      ((e = (function (t) {
        for (
          ;
          t &&
          (void 0 === t.tagName ||
            !(e = t) ||
            !e.tagName ||
            "a" !== e.tagName.toLowerCase() ||
            !t.href);

        )
          t = t.parentNode;
        var e;
        return t;
      })(t.target)) &&
        e.href &&
        e.href.split("?")[0],
      (i = e) &&
        i.href &&
        i.host &&
        i.host !== l.host &&
        ((i = t),
        (t = {
          name: "Outbound Link: Click",
          props: {
            url: (n = e).href,
          },
        }),
        (r = !1),
        !(function (t, e) {
          if (!t.defaultPrevented)
            return (
              (e = !e.target || e.target.match(/^_(self|parent|top)$/i)),
              (t =
                !(t.ctrlKey || t.metaKey || t.shiftKey) && "click" === t.type),
              e && t
            );
        })(i, n)
          ? ((a = {
              props: t.props,
            }),
            plausible(t.name, a))
          : ((a = {
              props: t.props,
              callback: o,
            }),
            plausible(t.name, a),
            setTimeout(o, 5e3),
            i.preventDefault())));
  }
  i.addEventListener("click", r), i.addEventListener("auxclick", r);
})();
