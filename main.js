$(document).ready(function() {
    console.log('ready!');
    let groupIndex = 0;
    let itemIndex = 0;
    let groups = [];
    let long = false;
    const timings = {
        groupIn: 250,
        groupOut: 250,
        itemIn: 3500,
        itemOut: 5000,
        letter: 250,
        word: 2000,
    }
    const styles = {
        highlighted: {
            'width': '100%',
            'border-color': '#203B59',
        },
        normal: {
            'border-color': '#506883',
          //  'color': '#FFBAAA',
        },
        normalh2: {
            'font-family': 'Roboto Thin, sans-serif',
            'font-size': '24px',
            //'color': '#802A15',
           // 'color': '#FFBAAA',
        }
    }
    $('ul.root').find('li.group').each(function() {
        let items = [];
        $(this).find('ul li').each(function() {
            let words = [];
            $(this).find('.word').each(function() {
                words.push($(this).on('runWord', runWord));
            });
            items.push({
                elm: $(this).find('.highlight'),
                words: words
            });
        })
        let group = {
            header: $(this).find('h2'),
            items: items,
        };
        groups.push($(group).on('runGroup', runGroup).on('runItems', runItems));
    })

    function runGroup() {
        groups[groupIndex].prop('header').animate(styles.highlighted, timings.groupIn, 'swing', function () {
            const group = groups[groupIndex];
            if (group.prop('header').hasClass('long')) {
                long = true;
            }
            $('#dialog').find('.content').text(group.prop('header').text());
            $('#dialog').dialog({
                autoOpen: false,
                height: "600",
                width: "600",
                modal: true,
                classes: {
                    "ui-dialog-title": "hide",
                    "ui-dialog-titlebar": "hide",
                    "ui-dialog-titlebar-close": "hide",
                    "ui-dialog": "modal-content",
                },
                title: '',
                show: {
                    effect: 'blind',
                    duration: 2000
                },
                hide: {
                    effect: 'puff',
                    duration: 1000
                }
            });
            $('#dialog').dialog("open");
            setTimeout(function () {
                $('#dialog').dialog("close");
                group.prop('header').parents('li').removeClass('unread');
                group.prop('header').addClass('read');
                $(this).animate(styles.normalh2, timings.groupOut, 'swing', function () {
                    let timeout = 0;
                    if (long) {
                        timeout = 1;
                    }
                    setTimeout(function() { group.trigger('runItems'); }, timeout);
                });
            }, 2000);
        });
    }

    function runItems() {
        const group = groups[groupIndex];
        if ($(group.prop('items')[itemIndex]).length > 0) {
            const wordCount = $(group.prop('items')[itemIndex]).prop('words').length;
            $(group.prop('items')[itemIndex]).prop('words')[0].trigger('runWord');
            $(group.prop('items')[itemIndex]).prop('elm').animate(styles.highlighted, timings.itemIn * wordCount, 'swing', function () {
                $(this).animate(styles.normal, timings.itemOut, 'swing', function () {
                    if (itemIndex < group.prop('items').length - 1) {
                        itemIndex++;
                        group.trigger('runItems');
                    } else {
                        if (groupIndex < groups.length - 1) {
                            itemIndex = 0;
                            groupIndex++;
                            group.trigger('runGroup');
                        } else {
                            console.log('finished');
                        }
                    }
                });
            });
        } else {
            groupIndex++;
            runGroup();
        }
    }

    let letters;
    let letterIndex = 0;

    function runWord()
    {
        //console.log('search');
        $(document).find('#search').removeClass('unread');
        //console.log('cd');
        //console.log($(document).find('#search').find('iframe').prop('contentDocument'));
        //let cd = $(document).find('#search').find('iframe').prop('contentDocument');
        let baseUrl = 'http://localhost:82/';
        //console.log('form');
        //const field = $(cd).find('#frmform-what');
        //console.log(field);
        if (!$(this).hasClass('active')) {
            letterIndex = 0;
            letters = $(this).text().replace(',', '');
            //field.val('');
            $(this).addClass('active');
            $(this).trigger('runWord');
        } else {
            if (letterIndex < letters.length) {
                //field.val(field.val() + letters[letterIndex]);
                letterIndex++;
                const t = $(this);
                setTimeout(function() { t.trigger('runWord'); }, timings.letter);
            } else {
                //const field = $(cd).find('#frmform-search');
                console.log($(document).find('#search').find('iframe').attr('src', baseUrl + letters));
                //field.click();
                if ($(this).next('.word').length > 0) {
                    const t = $(this);
                    setTimeout(
                        function() {
                            t.addClass('read');
                            t.parents('li').removeClass('unread');
                            t.removeClass('active');
                            t.next('.word').trigger('runWord');
                        },
                        timings.word
                    );
                } else {
                    $(this).addClass('read');
                    $(this).removeClass('active');
                }
            }
        }
    }

    console.log('start');
    groups[groupIndex].trigger('runGroup');
    console.log('end');
});
