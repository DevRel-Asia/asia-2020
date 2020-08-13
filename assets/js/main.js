/**
* Template Name: TheEvent - v2.2.0
* Template URL: https://bootstrapmade.com/theevent-conference-event-bootstrap-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

const changeLang = (lang) => {
  $('.lang').hide();
  $(`.lang.${lang}`).show();
}
const applicationKey = '8ae9a1897b1e2c40742aff799e228352521b70271fbc991d8f83c6fbed50c1fe';
const clientKey = '50367c73152a57e8929ff26ae5bba68c2ee5779c51195d01ea85cb84b14a14ad';
const ncmb = new NCMB(applicationKey, clientKey);
const CFP = ncmb.DataStore('CFP');

!(function($) {
  "use strict";
  const tip = localStorage.getItem('tip');
  if (!tip && blang.detect().toLowerCase() === 'en-us') {
    const langs = navigator.languages;
    if (langs.includes('ko')) {
      $('#language_change').attr('title', '여기에서 표시 언어를 영어에서 한국어로 변경할 수 있습니다.');
      $('[data-toggle="tooltip"]').tooltip('show');
    }
    if (langs.includes('vi')) {
      $('#language_change').attr('title', 'Bạn có thể thay đổi ngôn ngữ hiển thị tại đây');
      $('[data-toggle="tooltip"]').tooltip('show');
    }
    $('#navbarDropdown').on('click', (e) => {
      localStorage.setItem('tip', true);
      $('[data-toggle="tooltip"]').tooltip('hide');
    })
  }
  if (!$('table').hasClass('table')) {
    $('table').addClass('table');
  }
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
  });
  $('.lang').hide();
  if (blang.is.en()) {
    $('.lang.en').show();
  } else if (blang.is.ja()) {
    $('.lang.ja').show();
  } else if (blang.is.ko()) {
    $('.lang.ko').show();
  } else if (blang.is.zh()) {
    $('.lang.zh').show();
  } else if (blang.is.id()) {
    $('.lang.id').show();
  } else if (blang.is.vi()) {
    $('.lang.vi').show();
  } else if (blang.is.hi()) {
    $('.lang.in').show();
  }

  $.each($('.markdown .lang'), (i, e) => {
    $(e).html(marked($(e).text()));
  })

  $('#loadCfp').on('click', async (e) => {
    $('.load-message').html('Please wait a minute');
    const objectId = $('#id').val();
    const r = await fetch(`https://script.google.com/macros/s/AKfycbzZNpbhSOxRoGF6GTl8KpmyvvuYg-8f4o7lNM3CLpfmEWYutO1Z/exec?action=edit&id=${objectId}`);
    const cfp = await r.json();
    for (let key in cfp) {
      $(`form.cfp [name="${key}"`).val(cfp[key]);
    }
    $(`form.cfp [name="languages[]"]`).val('');
    cfp.languages.split(",").map(c => c.trim()).forEach(l => {
      $(`form.cfp [name="languages[]"] option[value="${l}"]`).prop("selected", true);
    })
    $('.load-message').html('Loaded. Please edit and send it again.');
  });

  const arrayToJson = (ary) => {
    const params = {};
    ary.forEach((k) =>  params[k.name] = k.value);
    return params;
  }
  $('.form form').on('submit', async (e) => {
    e.preventDefault();
    $('.form form .loading').show();
    const applicationKey = '8ae9a1897b1e2c40742aff799e228352521b70271fbc991d8f83c6fbed50c1fe';
    const signature = '/OSYSFAGZvKL2hbIgXy+h5x5r/d2OG074Awd1S/v79k=';
    const timestamp = '2020-07-07T02:56:52.369Z';
    try {
      await fetch('https://script.mbaas.api.nifcloud.com/2015-09-01/script/script.js', {
        method: 'POST',
        body: JSON.stringify(arrayToJson($('.form form').serializeArray())),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-NCMB-Application-Key': applicationKey,
          'X-NCMB-Signature': signature,
          'X-NCMB-Timestamp': timestamp
        }    
      });  
      $('.form form .loading').hide();
      $('.form form .sent-message').show();
      $('.form form .error-message').hide();
      $('.form form')[0].reset();
    } catch (e) {
      $('.form form .sent-message').hide();
      $('.form form .loading').hide();
      $('.form form .error-message').show();
    }
  })


  $('.save').on('keyup', (e) => {
    const form = localStorage.getItem('form') ? JSON.parse(localStorage.getItem('form')) : {};
    form[e.target.name] = e.target.value;
    localStorage.setItem('form', JSON.stringify(form));
  });

  $('.save_cfp').on('keyup', (e) => {
    if (e.target.multiple) return;
    const form = localStorage.getItem('cfp') ? JSON.parse(localStorage.getItem('cfp')) : {};
    form[e.target.name] = e.target.value;
    localStorage.setItem('cfp', JSON.stringify(form));
  });
  $('.save_cfp').on('change', (e) => {
    const form = localStorage.getItem('cfp') ? JSON.parse(localStorage.getItem('cfp')) : {};
    form[e.target.name] = $(e.target).val();
    localStorage.setItem('cfp', JSON.stringify(form));
  });

  if ($('form.cfp').length > 0) {
    const form = localStorage.getItem('form') ? JSON.parse(localStorage.getItem('form')) : {};
    for (let key in form) {
      const obj = $(`form.cfp [name=${key}]`);
      if (obj.length > 0) {
        obj.val(form[key]);
      }
    }
    const cfp = localStorage.getItem('cfp') ? JSON.parse(localStorage.getItem('cfp')) : {};
    for (let key in cfp) {
      const obj = $(`form.cfp [name="${key}"]`);
      if (obj.length > 0) {
        obj.val(cfp[key]);
      }
    }
  }

  async function sendCfp(cfp) {
    const acl = new ncmb.Acl();
    acl
      .setRoleReadAccess('Admin', true)
      .setRoleWriteAccess('Admin', true)
      .setPublicReadAccess(false);
    cfp.set('acl', acl);
    return await cfp.save();
  }

  async function updateCfp(objectId, cfp) {
    const url = `https://script.google.com/macros/s/AKfycbzZNpbhSOxRoGF6GTl8KpmyvvuYg-8f4o7lNM3CLpfmEWYutO1Z/exec`;
    return await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cfp)
    });    
  }

  $('form.cfp .hide').hide();
  $('form.cfp').on('submit', async (e) => {
    e.preventDefault();
    const ary = $(e.target).serializeArray();
    const cfp = new CFP;
    for (let key of ary) {
      if (key.name === 'languages[]') continue;
      if (key.name === 'objectId' && key.value === '') continue;
      cfp.set(key.name, key.value);
    }
    cfp.set('languages', $(e.target).find('[name="languages[]"').val());
    const objectId = $(e.target).find('[name="objectId"').val();
    try {
      if (objectId !== '') {
        await updateCfp(objectId, cfp);
        $(e.target).find('[name="objectId"').val('');
      } else {
        await sendCfp(cfp);
      }
      $('form.cfp .success').show();
      $('form.cfp .failure').hide();
      localStorage.removeItem('cfp');
      $('.save_cfp').val('');
    } catch (e) {
      $('form.cfp .success').hide();
      $('form.cfp .failure').show();
    }
    setTimeout(() => {
      $('form.cfp .hide').hide();
    }, 5000);
  });

  // Back to top button
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  $('.back-to-top').click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 1500, 'easeInOutExpo');
    return false;
  });

  // Header fixed on scroll
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('#header').addClass('header-scrolled');
    } else {
      $('#header').removeClass('header-scrolled');
    }
  });

  if ($(window).scrollTop() > 100) {
    $('#header').addClass('header-scrolled');
  }

  // Initialize Venobox
  $(window).on('load', function() {
    $('.venobox').venobox({
      bgcolor: '',
      overlayColor: 'rgba(6, 12, 34, 0.85)',
      closeBackground: '',
      closeColor: '#fff',
      share: false
    });
  });

  // Initiate superfish on nav menu
  $('.nav-menu').superfish({
    animation: {
      opacity: 'show'
    },
    speed: 400
  });

  // Mobile Navigation
  if ($('#nav-menu-container').length) {
    var $mobile_nav = $('#nav-menu-container').clone().prop({
      id: 'mobile-nav'
    });
    $mobile_nav.find('> ul').attr({
      'class': '',
      'id': ''
    });
    $('body').append($mobile_nav);
    $('body').prepend('<button type="button" id="mobile-nav-toggle"><i class="fa fa-bars"></i></button>');
    $('body').append('<div id="mobile-body-overly"></div>');
    $('#mobile-nav').find('.menu-has-children').prepend('<i class="fa fa-chevron-down"></i>');

    $(document).on('click', '.menu-has-children i', function(e) {
      $(this).next().toggleClass('menu-item-active');
      $(this).nextAll('ul').eq(0).slideToggle();
      $(this).toggleClass("fa-chevron-up fa-chevron-down");
    });

    $(document).on('click', '#mobile-nav-toggle', function(e) {
      $('body').toggleClass('mobile-nav-active');
      $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
      $('#mobile-body-overly').toggle();
    });

    $(document).click(function(e) {
      var container = $("#mobile-nav, #mobile-nav-toggle");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('#mobile-body-overly').fadeOut();
        }
      }
    });
  } else if ($("#mobile-nav, #mobile-nav-toggle").length) {
    $("#mobile-nav, #mobile-nav-toggle").hide();
  }

  // Smooth scroll for the navigation menu and links with .scrollto classes
  var scrolltoOffset = $('#header').outerHeight() - 21;
  if (window.matchMedia("(max-width: 991px)").matches) {
    scrolltoOffset += 20;
  }
  $(document).on('click', '.nav-menu a, #mobile-nav a, .scrollto', function(e) {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      if (target.length) {
        e.preventDefault();

        var scrollto = target.offset().top - scrolltoOffset;

        if ($(this).attr("href") == '#header') {
          scrollto = 0;
        }

        $('html, body').animate({
          scrollTop: scrollto
        }, 1500, 'easeInOutExpo');

        if ($(this).parents('.nav-menu').length) {
          $('.nav-menu .menu-active').removeClass('menu-active');
          $(this).closest('li').addClass('menu-active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('#mobile-body-overly').fadeOut();
        }
        return false;
      }
    }
  });

  // Activate smooth scroll on page load with hash links in the url
  $(document).ready(function() {
    if (window.location.hash) {
      var initial_nav = window.location.hash;
      if ($(initial_nav).length) {
        var scrollto = $(initial_nav).offset().top - scrolltoOffset;
        $('html, body').animate({
          scrollTop: scrollto
        }, 1500, 'easeInOutExpo');
      }
    }
  });

  // Navigation active state on scroll
  var nav_sections = $('section');
  var main_nav = $('.nav-menu, #mobile-nav');

  $(window).on('scroll', function() {
    var cur_pos = $(this).scrollTop() + 200;

    nav_sections.each(function() {
      var top = $(this).offset().top,
        bottom = top + $(this).outerHeight();

      if (cur_pos >= top && cur_pos <= bottom) {
        if (cur_pos <= bottom) {
          main_nav.find('li').removeClass('menu-active');
        }
        main_nav.find('a[href="#' + $(this).attr('id') + '"]').parent('li').addClass('menu-active');
      }
      if (cur_pos < 300) {
        $(".nav-menu li:first").addClass('menu-active');
      }
    });
  });

  // Init AOS
  function aos_init() {
    AOS.init({
      duration: 1000,
      once: true
    });
  }
  $(window).on('load', function() {
    aos_init();
  });

})(jQuery);