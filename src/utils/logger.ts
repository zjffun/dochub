import loglevel from "loglevel";
import prefix from "loglevel-plugin-prefix";

const logger = loglevel.getLogger("dochub");

prefix.reg(loglevel);

prefix.apply(logger, {
  template: "%n [%l]:",
  levelFormatter(level) {
    return level.toUpperCase();
  },
  nameFormatter(name) {
    return name || "dochub";
  },
  timestampFormatter(date) {
    return date.toISOString();
  },
});

export default logger;
