$(document).ready(function() {
    console.log('ready!');
    let groupIndex = 0;
    let itemIndex = 0;
    let groups = [];
    let long = false;
    const timings = {
        groupIn: 250,
        groupOut: 250,
        itemIn: 2500,
        itemOut: 1000,
        word: 2500,
    }
    const baseUrl = 'http://localhost:82/img/%1.png';
    //const baseUrl = 'https://www.kdejsme.cz/prijmeni/%1/hustota/';

    const styles = {
        highlighted: {
            'width': '100%',
            'border-color': '#203B59',
        },
        highlightedBorder: {
            'width': '100%',
            'border-color': '#203B59',
        },
        normal: {
        },
        normalBorder: {
            'border-color': '#506883',
            'opacity': 0.1,
        },
        normalh2: {
            'font-family': 'Roboto Thin, sans-serif',
            'font-size': '24px',
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
                height: "300",
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
                group.prop('header')[0].scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
                $(this).animate(styles.normalh2, timings.groupOut, 'swing', function () {
                    let timeout = 0;
                    if (long) {
                        timeout = 3000;
                    }
                    setTimeout(function() { group.trigger('runItems'); }, timeout);
                });
            }, 2000);
        });
    }

    function runItems() {
        const group = groups[groupIndex];
        if ($(group.prop('items')[itemIndex]).length > 0) {
            $(group.prop('items')[itemIndex]).prop('words')[0].trigger('runWord');
        } else {
            groupIndex++;
            runGroup();
        }
    }

    function runWord()
    {
        const letters = $(this).text().replace(',', '');
        $(document).find('#search').removeClass('unread');
        //$(document).find('#search').find('iframe').attr('src', baseUrl.replace('%1', letters));
        $(document).find('#search').find('img').attr('src', baseUrl.replace('%1', letters));
        $(this).addClass('active');
        $(this).addClass('read');
        const group = groups[groupIndex];
        $(this).parents('li').removeClass('unread');
        $(group.prop('items')[itemIndex]).prop('elm')[0].scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
        if ($(this).next('.word').length > 0) {
            const t = $(this);
            setTimeout(
                function() {
                    t.removeClass('active');
                    t.next('.word').trigger('runWord');
                },
                timings.word
            );
        } else {
            const t = $(this);
            setTimeout(
                function() {
                    t.removeClass('active');
                    $(group.prop('items')[itemIndex]).prop('elm').animate(styles.normalBorder, timings.itemOut, 'swing', function () {
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
                },
                timings.word
            );
        }
    }

    console.log('start');
    groups[groupIndex].trigger('runGroup');
    console.log('end');
});
