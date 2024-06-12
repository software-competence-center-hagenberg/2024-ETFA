public class workcellparkposcycle {
	private Object sqmain;
	private Object sqparkpos;
	private Object Robot1;

	public workcellparkposcycle(Object sqmain, Object sqparkpos, Object Robot1) {
		this.sqmain = sqmain;
		this.sqparkpos = sqparkpos;
		this.Robot1 = Robot1;
	}

	public void start () {
		SqMainParkPos__1();
	}

	private void SqMainParkPos__1 () {
		SqParkPosFromDeposit__1();

		SqParkPosFromDemolding__1();

		SqParkPosDefault__1();
	}

	private void SqParkPosFromDeposit__1 () {
		if (( ( ubInDepositAreaSide || ubInDepositAreaOpposite ) && ! ( ubPosPark ) )) {
			if (! ( ubInUSLDeposit )) {
				Motion.MoveSingle(tMoveJobSingle.enMoveJobSingleEnd, posUSLDeposit, dynPark);
			}
		}
	}

	private void SqParkPosFromDemolding__1 () {
		if (ubInMachineArea) {
			if (ubInDemoldingArea) {
				if (ubFrontSideDemolding) {
					Motion.MoveSingle(tMoveJobSingle.enMoveJobSingleStart, posWaitBeforeOpening.cart.z, dynPark);
				}
				else {
					Motion.MoveSingle(tMoveJobSingle.enMoveJobSingleStart, posWaitBeforeOpening.cart.x, dynPark);
				}
			}

			if (( ubDemoldingHoriz || ubDemoldingVertInHorizOut )) {
				Motion.MoveSingle(tMoveJobSingle.enMoveJobSingleStart, posWaitBeforeOpening.cart.y, dynPark);
			}
			else {
				Motion.MoveSingle(tMoveJobSingle.enMoveJobSingleStart, posUSLDemolding, dynPark);
			}

			SpecialCmds.SwivelToVB(dynPark);

			if (( posPark.cart.z.r > posMold.posMax.z.r )) {
				Motion.MoveSingle(tMoveJobSingle.enMoveJobSingleStart, posMold.posMax.z, dynPark);
			}

			if (( posPark.cart.z.r < posMold.posMin.z.r )) {
				Motion.MoveSingle(tMoveJobSingle.enMoveJobSingleStart, posMold.posMin.z, dynPark);
			}
		}
	}

	private void SqParkPosDefault__1 () {
		if (! ( ubPosPark )) {
			Motion.MoveAxis(tMoveJobAxis.enMoveJobAxisStart, iMoveAxisID14, posPark.cart.x, posUSLDeposit, posPark.cart.z, dynPark);

			if (( posPark.cart.y.r > posLSLDeposit.r )) {
				Motion.MoveSingle(tMoveJobSingle.enMoveJobSingleStart, posLSLDeposit, dynPark);
			}
		}

		while (!( SpecialCmds.ubSwivelToDeposFromVB || ( posPark.cart.x.ubFin && ( posUSLDeposit.ubFin && ( posPark.cart.z.ubFin && ! ( ubInMachineArea ) ) ) ) )) {}

		SpecialCmds.MoveHandToDepos(posPark.hand, dynPark);

		Motion.MoveRobot(tMoveJobRobot.enMoveJobRobotEnd, posPark, dynPark);
	}
}