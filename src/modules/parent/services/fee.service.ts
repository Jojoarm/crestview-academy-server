import {
  getAllApplicableFees,
  type FeeStructureQueryResult,
} from '../../shared/services/fee-structure.service.js';
import { getChildContext } from './child-access.service.js';

function toLean(structures: FeeStructureQueryResult[]) {
  return structures.map((s) => ({
    id: s.id,
    amount: s.amount,
    feeType: {
      name: s.feeType.name,
      description: s.feeType.description,
      frequency: s.feeType.frequency,
      isOptional: s.feeType.isOptional,
    },
    session: s.session ? { name: s.session.name } : null,
    term: s.term ? { name: s.term.name } : null,
  }));
}
export const parentFeeService = {
  async getChildFees(parentId: string, studentId: string) {
    const { enrollment } = await getChildContext(parentId, studentId);

    const { annual, perTerm } = await getAllApplicableFees(
      enrollment.classArm.classLevel.id,
    );

    return {
      classArm: {
        classLevel: enrollment.classArm.classLevel.name,
        arm: enrollment.classArm.arm.name,
      },
      fees: {
        annual: toLean(annual),
        perTerm: toLean(perTerm),
      },
    };
  },
};
