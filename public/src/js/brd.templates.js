brd.templates = (function() {
    'use strict';
    var buttons, form, day, dayLine, transaction, salary, shell;
    shell = [
        '<div class="brd-top">',
            '<div class="brd-top-logo">',
                '<h1>breadWinner</h1>',
            '</div>',
        '</div>',
        '<div class="brd-left">',
            '<div class="brd-shell-main">',
                '<div class="brd-shell-main-cal"></div>',
            '</div>',
        '</div>',
        '<div class="brd-right">',
            '<div class="brd-form"></div>',
            '<div class="brd-buttons"></div>',
        '</div>',
    ].join('\n');

    buttons = [
        '<div class="brd-buttons-main">',
            '<ul>',
            '<li class="brd-buttons-expense">',
                '<a href="#" class="brd-link-transaction pure-button">+</a>',
            '</li>',
            '<li class="brd-buttons-salary">',
                '<a href="#" class="brd-link-salary pure-button">$</a>',
            '</li>',
            '</ul>',
        '</div>'
    ].join('\n');

    form =  [
        '<div class="brd-form-inner">',
            '<div class="brd-form-target"></div>',
            '<div class="brd-form-data"></div>',
        '</div>'
    ].join('\n');

    day = [
        '<div class="brd-form-day-wrapper">',
            '<h3>June 2, 2015</h3>',
            '<div class="brd-form-day-transaction-list"></div>',
            '<div class="brd-transaction-info"></div>',
            '<div class="brd-form-day-buttons"></div>',
        '</div>'
    ].join('\n');

    dayLine = [
        '<div class="brd-transaction-info-wrapper">',
            'Name<br>Amount<br>Date',
        '</div>'
    ].join('\n');

    transaction = [
        '<div class="brd-form-transaction-wrapper">',
            '<form class="brd-form-transaction" id="brd-form-transaction">',
            '<fieldset>',
                '<legend>Create a transaction</legend>',

                '<fieldset class="brd-radio-fieldset">',
                    '<label for="brd-transaction-type-income" class="brd-radio">',
                    '<input id="brd-transaction-type-income" class="brd-transaction-type" type="radio" name="transactionType" value="income">',
                        'Income',
                    '</label>',
                    '<label for="brd-transaction-type-expense" class="brd-radio">',
                    '<input id="brd-transaction-type-expense" class="brd-transaction-type" type="radio" name="transactionType" value="expense" checked>',
                        'Expense',
                    '</label>',
                '</fieldset>',
                '<label for="brd-transaction-name">Transaction Name</label>',
                    '<input id="brd-transaction-name" placeholder="Transaction Name">',
                    '<label for="brd-transaction-amt">Amount</label>',
                    '<input id="brd-transaction-amt" class="brd-amt" placeholder="Amount">',
                    '<label for="brd-transaction-date">Date</label>',
                    '<input id="brd-transaction-date" class="brd-date" placeholder="Date" type="date">',
                    '<button type="button" class="brd-button-transaction">Submit</button>',
                '</fieldset>',
            '</form>',
        '</div>'
    ].join('\n');

    salary = [
        '<div class="brd-form-salary-wrapper">',
            '<form class="brd-form-salary">',
                '<fieldset>',
                    '<legend>Set your salary</legend>',
                    '<label for="brd-salary-amt">Amount</label>',
                    '<input id="brd-salary-amt" class="brd-amt" placeholder="Amount">',
                    '<label for="brd-salary-options">Type</label>',
                    '<fieldset>',
                        '<select id="brd-salary-options">',
                            '<option>Monthly</option>',
                            '<option>Semi-monthly</option>',
                            '<option>Bi-weekly</option>',
                            '<option>Weekly</option>',
                        '</select>',
                    '</fieldset>',
                    '<button type="button" class="brd-button-submit brd-button-salary">Submit</button>',
                '</fieldset>',
            '</form>',
        '</div>'
    ].join('\n');

    return {
        shell: shell,
        buttons: buttons,
        form: form,
        day: day,
        dayLine: dayLine,
        transaction: transaction,
        salary: salary
    }
}());