/* ============================================================
   terminal.js — progressive enhancement for console-enabled pages.
   Three independent features, all no-ops when their hooks are absent:
     1. Hero typing animation        ([data-typed])
     2. Active-section + statusbar    ([data-nav] / [data-status-path])
     3. Interactive console           (~ / Ctrl-K, virtual FS from #vfs-data)
   Privacy pages never load this file.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BASE = document.body.getAttribute('data-base') || '/';
  var HOME = BASE; // home page URL

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  /* ---------- read virtual filesystem ---------- */
  var vfs = null;
  var vfsEl = document.getElementById('vfs-data');
  if (vfsEl) {
    try {
      vfs = JSON.parse(vfsEl.textContent);
    } catch (e) {
      vfs = null;
    }
  }

  /* ============================================================
     1. Hero typing animation
     ============================================================ */
  (function typing() {
    var el = document.querySelector('[data-typed]');
    if (!el) return;
    var text = el.getAttribute('data-text') || el.textContent;
    if (reduceMotion) {
      el.textContent = text;
      return;
    }
    el.textContent = '';
    var i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, 65);
      }
    })();
  })();

  /* ============================================================
     2. Active section -> topnav + vim statusbar path
     ============================================================ */
  (function sections() {
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('[data-nav]')
    );
    if (!navLinks.length || !('IntersectionObserver' in window)) return;
    var pathEl = document.querySelector('[data-status-path]');
    var sectionEls = navLinks
      .map(function (a) {
        var id = a.getAttribute('href');
        return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    function activate(id) {
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
      if (pathEl) pathEl.textContent = id === 'home' ? '~' : '~/' + id;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) activate(en.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sectionEls.forEach(function (s) {
      obs.observe(s);
    });
  })();

  /* ============================================================
     2b. Screenshot slider arrows (product pages)
     ============================================================ */
  (function slider() {
    var track = document.querySelector('[data-shots]');
    if (!track) return;
    var prev = document.querySelector('[data-shots-prev]');
    var next = document.querySelector('[data-shots-next]');
    if (!prev || !next) return;

    function stepSize() {
      var item = track.querySelector('.shot-img, .shot');
      var gap = 14;
      return item
        ? item.getBoundingClientRect().width + gap
        : track.clientWidth * 0.8;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= max;
    }
    function go(dir) {
      track.scrollBy({
        left: dir * stepSize(),
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }
    prev.addEventListener('click', function () {
      go(-1);
    });
    next.addEventListener('click', function () {
      go(1);
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ============================================================
     3. Console
     ============================================================ */
  if (!vfs) return; // nothing to drive a console with

  /* ---- build the virtual filesystem tree from data ---- */
  function fileNode(content) {
    return { type: 'file', content: content };
  }
  var skills = vfs.skills || {};
  var profile = vfs.profile || {};
  var contacts = profile.contacts || {};
  var root = {
    type: 'dir',
    children: {
      'about.md': fileNode(
        profile.name +
          ' — ' +
          profile.role +
          '\n\n' +
          profile.about.join('\n\n')
      ),
      'contact.txt': fileNode(
        'email    ' +
          contacts.email +
          '\n' +
          'github   ' +
          contacts.github.url +
          (contacts.telegram
            ? '\ntelegram ' + contacts.telegram.url
            : '')
      ),
      skills: { type: 'dir', children: {} },
      projects: { type: 'dir', children: {} },
    },
  };
  Object.keys(skills).forEach(function (cat) {
    root.children.skills.children[cat] = fileNode(skills[cat].join('\n'));
  });
  vfs.projects.forEach(function (p) {
    var storeTxt =
      p.appStore.status === 'live'
        ? 'App Store: ' + p.appStore.url
        : p.appStore.status === 'coming-soon'
        ? 'App Store: coming soon'
        : 'App Store: not distributed';
    var node = {
      type: 'dir',
      nav: p.url,
      meta: p,
      children: {
        'README.md': fileNode(
          p.name +
            '\n' +
            p.tagline +
            '\n\n' +
            p.badges.join(' · ') +
            '\n' +
            storeTxt
        ),
      },
    };
    if (p.privacy) {
      node.children['privacy'] = { type: 'dir', nav: p.url + 'privacy/', children: {} };
    }
    root.children.projects.children[p.slug] = node;
  });

  /* current project, if we're on a product page */
  var curProject = null;
  vfs.projects.forEach(function (p) {
    if (location.pathname.replace(/\/$/, '') === p.url.replace(/\/$/, ''))
      curProject = p;
  });

  /* ---- DOM ---- */
  var overlay = document.createElement('div');
  overlay.className = 'term-overlay';
  overlay.innerHTML =
    '<div class="term-window" role="dialog" aria-label="Console" aria-modal="true">' +
    '<div class="term-titlebar"><span class="dots"><i></i><i></i><i></i></span>' +
    '<span>maxim@portfolio: ~</span>' +
    '<button class="term-close" type="button" aria-label="Close console">[esc]</button></div>' +
    '<div class="term-body" data-term-body></div>' +
    '<div class="term-inputline"><span class="prefix"></span>' +
    '<input class="term-input" autocomplete="off" autocapitalize="off" ' +
    'autocorrect="off" spellcheck="false" aria-label="Console input" /></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var body = overlay.querySelector('[data-term-body]');
  var input = overlay.querySelector('.term-input');
  var prefixEl = overlay.querySelector('.prefix');
  var closeBtn = overlay.querySelector('.term-close');

  var cwd = curProject ? '~/projects/' + curProject.slug : '~';
  var history = [];
  var histIdx = -1;
  var booted = false;
  var vimMode = false;

  function setPrefix() {
    prefixEl.innerHTML =
      '<span class="pth">' + esc(cwd) + '</span> $&nbsp;';
  }
  setPrefix();

  function print(html, cls) {
    var line = document.createElement('div');
    line.className = 'term-line' + (cls ? ' ' + cls : '');
    line.innerHTML = html;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
    return line;
  }
  function printText(text, cls) {
    print(esc(text).replace(/\n/g, '<br>'), cls);
  }
  function echoCmd(raw) {
    print(
      '<span class="pth">' + esc(cwd) + '</span> <span class="sig">$</span> ' + esc(raw),
      'cmd'
    );
  }

  /* ---- commands ---- */
  var commands = {
    help: function () {
      printText(
        'Available commands:\n' +
          '  help              this list\n' +
          '  ls [path]         list a directory\n' +
          '  cd <path>         go to a section or project\n' +
          '  cat <file>        print a file (about.md, contact.txt, skills/ios)\n' +
          '  open <target>     appstore | privacy | github | <slug>\n' +
          '  whoami            who is this\n' +
          '  clear             clear the screen\n' +
          '\nTry: cat about.md · ls projects · cd projects'
      );
    },

    ls: function (args) {
      var dir = resolveDir(args[0]);
      if (!dir) {
        printText('ls: no such directory: ' + (args[0] || ''), 'err');
        return;
      }
      var names = Object.keys(dir.children || {});
      if (!names.length) {
        printText('(empty)');
        return;
      }
      print(
        names
          .map(function (n) {
            var child = dir.children[n];
            return child.type === 'dir'
              ? '<span class="pth">' + esc(n) + '/</span>'
              : esc(n);
          })
          .join('   ')
      );
    },

    cd: function (args) {
      var target = args[0];
      if (!target || target === '~' || target === '/') {
        if (location.pathname.replace(/\/$/, '') !== HOME.replace(/\/$/, '')) {
          go(HOME);
        } else {
          scrollToId('home');
          cwd = '~';
          setPrefix();
        }
        return;
      }
      if (target === '..') {
        go(HOME);
        return;
      }
      // section on current page?
      var clean = target.replace(/\/$/, '');
      if (document.getElementById(clean)) {
        scrollToId(clean);
        cwd = clean === 'home' ? '~' : '~/' + clean;
        setPrefix();
        printText('→ ' + cwd, 'ok');
        return;
      }
      // navigable directory (project)?
      var dir = resolveDir(target);
      if (dir && dir.nav) {
        printText('opening ' + target + '…', 'ok');
        go(dir.nav);
        return;
      }
      printText('cd: not found: ' + target + '  (try: cd projects)', 'err');
    },

    cat: function (args) {
      var node = resolvePath(args[0]);
      if (!node) {
        printText('cat: no such file: ' + (args[0] || ''), 'err');
        return;
      }
      if (node.type === 'dir') {
        printText('cat: ' + args[0] + ': is a directory (try: ls ' + args[0] + ')', 'err');
        return;
      }
      printText(node.content);
    },

    open: function (args) {
      var t = (args[0] || '').toLowerCase();
      if (t === 'github') {
        printText('opening github…', 'ok');
        win(contacts.github.url);
        return;
      }
      if (t === 'appstore' || t === 'app-store') {
        var p = curProject || projectFromArg(args[1]);
        if (!p) {
          printText('open: which app? try: open appstore <slug>', 'err');
          return;
        }
        if (p.appStore.status === 'live') {
          printText('opening App Store…', 'ok');
          win(p.appStore.url);
        } else {
          printText(p.name + ' — App Store: coming soon', 'ok');
        }
        return;
      }
      if (t === 'privacy') {
        var pp = curProject || projectFromArg(args[1]);
        if (!pp) {
          printText('open: which privacy policy? try: open privacy <slug>', 'err');
          return;
        }
        go(pp.url + 'privacy/');
        return;
      }
      // open <slug>
      var proj = projectFromArg(t);
      if (proj) {
        go(proj.url);
        return;
      }
      printText('open: unknown target: ' + t, 'err');
    },

    whoami: function () {
      printText(profile.name + ' — ' + profile.role);
    },

    clear: function () {
      body.innerHTML = '';
    },

    /* ---- easter eggs ---- */
    sudo: function () {
      printText(
        profile.name.split(' ')[0].toLowerCase() +
          ' is not in the sudoers file. This incident will be reported.',
        'err'
      );
    },
    vim: function () {
      vimMode = true;
      printText(
        '~\n~            VIM  -  Vi IMproved\n~\n' +
          '~   you are now trapped in vim, like everyone before you\n' +
          '~   type  :q!  and press Enter to escape\n~'
      );
    },
    fortune: function () {
      var fortunes = [
        '“Weeks of coding can save you hours of planning.”',
        '“There are two hard things in CS: cache invalidation, naming things, and off-by-one errors.”',
        '“It works on my machine.” — every developer, once',
        '“Premature optimization is the root of all evil.” — Donald Knuth',
        '“Ship it. We’ll fix it in prod.” — nobody wise, ever',
        '“The best code is no code at all.”',
      ];
      printText(fortunes[Math.floor(Math.random() * fortunes.length)]);
    },
  };

  /* ---- path resolution ---- */
  function resolveDir(path) {
    var node = resolvePath(path, true);
    return node && node.type === 'dir' ? node : null;
  }
  function resolvePath(path, dirContext) {
    if (!path || path === '~' || path === '/' || path === '.') return root;
    var parts = path.replace(/^\/+|\/+$/g, '').split('/');
    var node = root;
    for (var i = 0; i < parts.length; i++) {
      if (!node.children || !node.children[parts[i]]) return null;
      node = node.children[parts[i]];
    }
    return node;
  }
  function projectFromArg(arg) {
    if (!arg) return null;
    var slug = arg.replace(/^projects\//, '').replace(/\/$/, '');
    var found = null;
    vfs.projects.forEach(function (p) {
      if (p.slug === slug) found = p;
    });
    return found;
  }

  /* ---- navigation helpers ---- */
  function go(url) {
    window.location.href = url;
  }
  function win(url) {
    window.open(url, '_blank', 'noopener');
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* ---- glitch easter egg: rm -rf ---- */
  function rmrf() {
    printText('rm: it is too late to ask for permission…', 'err');
    var win = overlay.querySelector('.term-window');
    win.classList.add('term-glitch');
    document.body.classList.add('term-glitch');
    setTimeout(function () {
      win.classList.remove('term-glitch');
      document.body.classList.remove('term-glitch');
      printText('just kidding. everything is fine. 🙂', 'ok');
    }, 1500);
  }

  /* ---- command dispatch ---- */
  function run(raw) {
    var line = raw.trim();
    if (vimMode) {
      if (line === ':q!' || line === ':q' || line === ':wq' || line === ':x') {
        vimMode = false;
        printText('escaped vim. you are free now.', 'ok');
      } else {
        printText('E37: type  :q!  to exit (you really are stuck)', 'err');
      }
      return;
    }
    if (!line) return;
    history.push(line);
    histIdx = history.length;

    var tokens = line.split(/\s+/);
    var name = tokens[0].toLowerCase();
    var args = tokens.slice(1);

    if (/^rm$/.test(name) && /-rf/.test(line) && /(\/|\*)/.test(line)) {
      rmrf();
      return;
    }
    if (name === 'sudo') {
      commands.sudo();
      return;
    }
    if (commands[name]) {
      commands[name](args);
    } else {
      printText(
        name + ': command not found. type ' + 'help' + ' for a list.',
        'err'
      );
    }
  }

  /* ---- autocomplete ---- */
  function complete() {
    var val = input.value;
    var tokens = val.split(/\s+/);
    if (tokens.length <= 1) {
      var cmds = Object.keys(commands).filter(function (c) {
        return c.indexOf(tokens[0]) === 0;
      });
      if (cmds.length === 1) input.value = cmds[0] + ' ';
      else if (cmds.length > 1) printText(cmds.join('   '));
      return;
    }
    // complete a path argument from root listing one level deep
    var last = tokens[tokens.length - 1];
    var segs = last.split('/');
    var stem = segs.pop();
    var dir = resolveDir(segs.join('/') || '~');
    if (!dir) return;
    var matches = Object.keys(dir.children || {}).filter(function (n) {
      return n.indexOf(stem) === 0;
    });
    if (matches.length === 1) {
      segs.push(matches[0]);
      tokens[tokens.length - 1] =
        segs.join('/') +
        (dir.children[matches[0]].type === 'dir' ? '/' : '');
      input.value = tokens.join(' ');
    } else if (matches.length > 1) {
      printText(matches.join('   '));
    }
  }

  /* ---- open / close ---- */
  function openConsole() {
    overlay.classList.add('is-open');
    if (!booted) {
      printText(
        'maxim@portfolio — type help to get started, esc to close.',
        'ok'
      );
      booted = true;
    }
    setTimeout(function () {
      input.focus();
    }, 0);
  }
  function closeConsole() {
    overlay.classList.remove('is-open');
    input.blur();
  }
  function toggleConsole() {
    overlay.classList.contains('is-open') ? closeConsole() : openConsole();
  }

  /* ---- events ---- */
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var raw = input.value;
      echoCmd(raw);
      input.value = '';
      run(raw);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = history[histIdx] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx] || '';
      } else {
        histIdx = history.length;
        input.value = '';
      }
    } else if (e.key === 'Escape') {
      closeConsole();
    }
  });

  closeBtn.addEventListener('click', closeConsole);
  overlay.addEventListener('mousedown', function (e) {
    if (e.target === overlay) closeConsole();
  });

  var opener = document.querySelector('[data-term-open]');
  if (opener) opener.addEventListener('click', openConsole);

  document.addEventListener('keydown', function (e) {
    var typing =
      document.activeElement &&
      /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    // Ctrl/Cmd-K toggles from anywhere
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      toggleConsole();
      return;
    }
    // backtick / tilde opens, when not typing elsewhere
    if (!typing && (e.key === '`' || e.key === '~')) {
      e.preventDefault();
      openConsole();
    }
  });
})();
