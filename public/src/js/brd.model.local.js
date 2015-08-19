brd.model.local = (function() {
	'use strict';
	var config = {
		isConnected: false,
		anonId: 'a0',
		monthFormat: 'YYYY-MM',
		dayFormat: 'YYYY-MM-DD'
	},
	state = {
		user: undefined,
		currentMonth: undefined,
		storage: undefined
	},
	initModule, save,
	makeUser, makeMonth, makeTransaction,
	addMonth, addTransaction, add, addIncome, addExpense, setSalary,
	getMonthData, getTransaction, deleteTransaction, subtract, subtractExpense,
	subtractIncome, getMonthTransactions, getSalary, getStorageFunction, getTransaction, getDifference,
		getYearMonthFromFormattedDateString;

	subtract = function(amount, type, monthDate) {
		var month = state.user.months[monthDate];
		if (type === 'expense') {
			subtractExpense(Math.abs(amount), month);
		} else if (type === 'income') {
			subtractIncome(Math.abs(amount), month);
		} 
	};

	subtractExpense = function(amount, month) {
		month.expenses -= amount;
	};

	subtractIncome = function(amount, month) {
		month.income -= amount;
	};

	add = function(name, amount, date, type, id) {
		var monthDate = getYearMonthFromFormattedDateString(date), month, transaction;
		month = state.user.months[monthDate];

		if (!month) {
			month = addMonth(monthDate);
		}

		if (id) {
			var transactions = state.user.months[month.date].transactions;
			for (var tid in transactions) {
				if (transactions.hasOwnProperty(tid) && transactions[tid].id == id) {
					subtract(transactions[tid].amount, transactions[tid].type, month.date);
				}
			}
		}

		transaction = addTransaction(name, amount, date, type, month, id);

		if (type === 'expense') {
			addExpense(amount, month);

		} else if (type === 'income') {
			addIncome(amount, month);
		}

		save(month, transaction, true);
		return transaction;
	};

	addIncome = function(amount, month) {
		month.income += amount;
	};

	addExpense = function(amount, month) {
		month.expenses += amount;
	};

	save = function(month, transaction, fireEvent) {
		//localStorage.setItem(state.user.id, JSON.stringify(state.user));
		state.storage.setItem(state.user.id, JSON.stringify(state.user));
		if (fireEvent)
			$.event.trigger(brd.event.modelUpdate, [transaction, month.expenses, month.income + month.salary]);
	};

	addMonth = function(date, income, expenses, transactions, salary) {
		var month = makeMonth(date, income, expenses, transactions, salary);
		state.user.months[month.date] = month;
		save(month, undefined, false);
		return state.user.months[month.date];
	};

	addTransaction = function(name, amount, date, type, month, id) {
		var transaction, tid;

		tid = id || Date.now();
		transaction  = makeTransaction(tid, name, amount, type, date),
		month.transactions[transaction.id] = transaction;

		return {
			id: transaction.id,
			name: transaction.name,
			amount: transaction.amount,
			type: type,
			date: transaction.date
		}
	};

	setSalary = function(amount, type, date) {
		state.user.salary = amount;
		state.user.salaryType = type;
		var month = state.user.months[date];
		month.salary = amount;
		save(month, undefined, false);
	};

	//Sets salary for current month going forward.
	//Will need to wait til next month to change salary if it changes.
	getSalary = function() {
		return {
			salary: state.user.salary,
			salaryType: state.user.salaryType
		};
	};

	makeMonth = function(date, income, expenses, transactions, salary) {
		var userSalary;
		if (!date) return false;

		if (state.user && state.user.salary) {
			userSalary = state.user.salary;
		}

		return {
			date: date,
			income: income || 0,
			expenses: expenses || 0,
			transactions: transactions || {},
			salary: salary || userSalary || 0
		};

	};

	makeTransaction = function(id, name, amount, type, date) {
		return {
			id: id,
			name: name,
			amount: amount,
			type: type,
			date: date
		};
	}

	makeUser = function() {
		var date = moment().format(config.monthFormat),
		months = {}, month, user;
		month = makeMonth(date);
		months[month.date] = month;

		user = {
			id: config.anonId,
			months: months,
			salary: 0,
			salaryType: 'Monthly'
			//recurringTransactions!
		};
		return user;

	};

	getMonthData = function(date) {
		var month = state.user.months[date],
		endOfMonth;
		//could be better...
		endOfMonth = moment('01-' + date, 'DD-MM-YYYY').endOf('month').date();

		if (!month) {
			return {
				date: date,
				endOfMonth: endOfMonth,
				expenses: 0,
				income: getSalary().salary
			}
		}

		return {
			date: month.date,
			endOfMonth: endOfMonth,
			numerator: month.expenses,
			denominator: month.income + month.salary
		};
	};

	//kinda horrible right now...
	//issue is that it returns {} or [] depending on date.
	getMonthTransactions = function(date) {
		var month, transactions = [], tid;
		if (date.length == config.monthFormat.length) {
			month = state.user.months[date];
			if (month && month.transactions) {
				return month.transactions;
			}
		} else if (date.length == config.dayFormat.length) {
			month = state.user.months[getYearMonthFromFormattedDateString(date)];
			if (month && month.transactions) {
				for (tid in month.transactions) {
					if (month.transactions.hasOwnProperty(tid) && month.transactions[tid].date == date) {
						transactions.push(month.transactions[tid]);
					}
				}
				return transactions;
			}
		}


		return false;
	};

	getTransaction = function(id) {
		var month;
		for (var date in state.user.months) {
			month = state.user.months[date];
			if (month.transactions.hasOwnProperty(id)) {
				return month.transactions[id];
			}
		}
		return false;
	};

	deleteTransaction = function(month, tid, amount, type) {
		var transactions = state.user.months[month].transactions;

		for (var id in transactions) {
			if (transactions.hasOwnProperty(id) && transactions[id].id === tid) {
				delete transactions[id];
			}
		}

		subtract(amount, type, month);

		save(state.user.months[month], undefined, true);

	};

	getYearMonthFromFormattedDateString = function(date) {
		return date.slice(0, 7);
	};

	getStorageFunction = function() {
		var testKey = 'test';
		try {
			localStorage.setItem(testKey, '1');
			localStorage.removeItem(testKey);
			return localStorage;
		} catch (error) {
			var storage = (function() {
				var setItem, getItem, removeItem;
				setItem = function(key, value) {
					this[key] = value;
				}
				getItem = function(key) {
					if (this[key]) {
						return this[key];
					}
					return null;
				}
				removeItem = function(key) {
					delete this[key];
				}
				return {setItem: setItem, getItem: getItem, removeItem: removeItem};
			}());
			return storage;
		}
	};

	initModule = function() {
		state.storage = getStorageFunction();
		var user = state.storage.getItem(config.anonId);
		if (!user) {
			user = makeUser();
			state.storage.setItem(user.id, JSON.stringify(user));
			state.user = user;
		} else {
			state.user = JSON.parse(user);
		}
	};

	return {
		initModule: initModule,
		add: add,
		setSalary: setSalary,
		getSalary: getSalary,
		addMonth: addMonth,
		getMonthData: getMonthData,
		deleteTransaction: deleteTransaction,
		getMonthTransactions: getMonthTransactions,
		getTransaction: getTransaction
	};

}());