String.prototype.format = String.prototype.f = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

Date.prototype.getMonthName = function () {
    var m = ["janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "decembre"
    ];
    return m[this.getMonth()];
};

Date.prototype.getDayName = function () {
    var d = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    return d[this.getDay()];
};