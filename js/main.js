(function () {
  var METRIKA_ID = 47287257;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  var cookie = document.getElementById("cookie");
  var accept = document.getElementById("cookie-accept");
  var reopen = document.getElementById("cookie-reopen");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 4);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        toggle.focus();
      }
    });
  }

  function loadMetrika() {
    if (window.__ymLoaded) return;
    window.__ymLoaded = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(METRIKA_ID, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    });
  }

  function reach(goal) {
    if (typeof ym === "function") ym(METRIKA_ID, "reachGoal", goal);
  }

  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener("click", function () { reach("phone_click"); });
  });

  if (localStorage.getItem("cookie-ok") === "1") {
    loadMetrika();
  } else if (cookie) {
    cookie.hidden = false;
  }

  if (accept) {
    accept.addEventListener("click", function () {
      localStorage.setItem("cookie-ok", "1");
      if (cookie) cookie.hidden = true;
      loadMetrika();
    });
  }

  if (reopen) {
    reopen.addEventListener("click", function () {
      localStorage.removeItem("cookie-ok");
      if (cookie) cookie.hidden = false;
    });
  }

  var form = document.getElementById("request-form");
  if (!form) return;

  var status = document.getElementById("form-status");

  function setStatus(text, ok) {
    status.textContent = text;
    status.classList.toggle("is-ok", !!ok);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setStatus("", false);

    if (form.website && form.website.value) return;

    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var email = form.email.value.trim();
    var comment = form.comment.value.trim();
    var digits = phone.replace(/\D/g, "");

    if (name.length < 2) {
      setStatus("Напишите имя.");
      form.name.focus();
      return;
    }
    if (digits.length < 10) {
      setStatus("Проверьте телефон: нужно не меньше 10 цифр.");
      form.phone.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Проверьте почту.");
      form.email.focus();
      return;
    }
    if (!form.consent.checked) {
      setStatus("Нужно согласие на обработку персональных данных.");
      form.consent.focus();
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;

    fetch("send.php", {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || !data.ok) throw new Error(data.error || "fail");
          return data;
        });
      })
      .then(function () {
        reach("form_submit");
        form.reset();
        setStatus("Заявка отправлена. Гостиница свяжется с вами по телефону или почте.", true);
      })
      .catch(function () {
        setStatus("Не получилось отправить заявку. Позвоните: +7 (978) 873-00-07.");
      })
      .finally(function () {
        button.disabled = false;
      });
  });
})();
