import { motion } from "framer-motion";
import EquityCurve from "./EquityCurve";
import WinRateTrend from "./WinRateTrend";
import DisciplineGraph from "./DisciplineGraph";
import LessonsLearned from "./LessonsLearned";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AnalyticsSection({ data, filteredTrades }) {
  const trades = filteredTrades || data.recentTrades || [];

  return (
    <motion.div
      className="analytics-section"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="analytics-full">
        <EquityCurve trades={trades} startingCapital={data.startingCapital ?? 0} />
      </motion.div>
      <div className="analytics-grid">
        <motion.div variants={itemVariants}>
          <WinRateTrend trades={trades} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DisciplineGraph data={data} />
        </motion.div>
      </div>
      <motion.div variants={itemVariants}>
        <LessonsLearned data={data} />
      </motion.div>
    </motion.div>
  );
}
