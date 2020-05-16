const mod = require('./utility');
const pathMod = require('path');
mod.writeWelcomePage("hollow_knight", true,
    pathMod.join(__dirname, "static", "welcome.html"), ["charm", "charm_list", "area"]);
